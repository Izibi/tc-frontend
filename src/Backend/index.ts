
import * as Immutable from 'immutable';
import {eventChannel, Channel, END, CANCEL} from "redux-saga";
import {call, fork, put, select, take, takeEvery, takeLatest} from "redux-saga/effects";
import update from 'immutability-helper';
import * as qs from 'querystring';

import {Saga, actionCreators, Actions, ActionTypes, ActionsOfType, AppToaster, State} from "../app";
import {without} from "../utils";

import {Block, BlockInfo, ChainFilters} from '../types';
import {BackendState, PreEntities, PreGameInfo, OptimisticChange, Collection} from "./types";
import * as _selectors from "./selectors";

export {BackendState} from "./types";
export {default as BackendFeedback} from "./Feedback";
export const selectors = _selectors;

const initialEntities = {
  users: {},
  contests: {},
  tasks: {},
  taskResources: {},
  teams: {},
  teamMembers: {},
  chains: {},
};

export const backendInit : BackendState = {
  backend: {
    generation: 0,
    lastError: undefined,
    tasks: [],
    pristineEntities: initialEntities,
    optimisticChanges: [],
  },
  eventSource: {
    key: "",
    channels: [],
  },
  entities: initialEntities,
  games: Immutable.Map()
};

export function backendReducer (state: State, action: Actions): State {
  switch (action.type) {

    /* XXX this is wrong, each task can have its set of optimistic changes;
       but for now this is good enough. */

    case ActionTypes.BACKEND_TASK_STARTED: {
      const {task, optimisticChanges} = action.payload;
      state = update(state, {backend: {
        tasks: {$push: [task]},
        lastError: {$set: undefined},
        optimisticChanges: {$set: optimisticChanges || []},
      }});
      return flushSelectorCache(state);
    }
    case ActionTypes.BACKEND_TASK_FAILED: {
      const {task, error} = action.payload;
      state = update(state, {backend: {
        tasks: {$apply: (tasks: object[]) => without(tasks, task)},
        lastError: {$set: error},
        optimisticChanges: {$set: []},
      }});
      return flushSelectorCache(state);
    }
    case ActionTypes.BACKEND_TASK_DONE: {
      const {task} = action.payload;
      state = update(state, {backend: {
        tasks: {$apply: (tasks: object[]) => without(tasks, task)},
        optimisticChanges: {$set: []}
      }});
      return flushSelectorCache(state);
    }
    case ActionTypes.BACKEND_ENTITIES_LOADED: {
      let entities: PreEntities = state.backend.pristineEntities;
      entities = updateEntities(entities, action.payload.entities);
      state = update(state, {backend: {
        pristineEntities: {$set: entities},
      }});
      return flushSelectorCache(state);
    }

    case ActionTypes.GAME_LOADED: {
      const {gameKey, game, blocks: newBlocks} = action.payload;
      const prevGI : PreGameInfo | undefined = state.games.get(gameKey);
      let blocks : Immutable.List<BlockInfo> = prevGI === undefined ? Immutable.List() : prevGI.blocks;
      if (newBlocks !== null) {
        for (let block of newBlocks) {
          blocks = blocks.set(block.sequence, block);
        }
      }
      state = flushSelectorCache({
        ...state,
        games: state.games.set(gameKey, {game, blocks}),
      });
      break;
    }

    case ActionTypes.CONTEST_LIST_CHANGED: {
      const {contestIds} = action.payload;
      return {...state, contestIds};
    }
    case ActionTypes.CONTEST_CHANGED: {
      const {contestId} = action.payload;
      // Teams are per-contest? so when the contest changes, forget the current team.
      return {...state, contestId, teamId: "unknown"};
    }
    case ActionTypes.TEAM_CHANGED: {
      let {teamId} = action.payload;
      return {...state, teamId};
    }
    case ActionTypes.EVENTSOURCE_KEY_CHANGED: {
      const {key} = action.payload;
      return {...state, eventSource: {key, channels: []}};
    }
    case ActionTypes.EVENTSOURCE_SUBS_CHANGED: {
      const {channels} = action.payload;
      return {...state, eventSource: {...state.eventSource, channels}};
    }

  }
  return state;
}

type Message = {
  channel: string,
  payload: string,
}

type ApiResponse<T> = {result?: T} | {error: string, details?: string}

export function* saga(): Saga {
  yield takeLatest(ActionTypes.USER_LOGGED_IN, function* (): Saga {
    const resp : ApiResponse<string> = yield call(postJson, `${process.env.BACKEND_URL}/Events`, null);
    if ('error' in resp) {
      console.log('failed to create event stream', resp);
      return;
    }
    const streamKey = resp.result;
    let channels : string[] = [];
    yield takeLatest(ActionTypes.CONTEST_CHANGED, function* (action: ActionsOfType<typeof ActionTypes.CONTEST_CHANGED>): Saga {
      console.log('CONTEST CHANGED', action.payload.contestId);
    });
    yield takeEvery(ActionTypes.EVENTSOURCE_SUBS_CHANGED, syncSubscriptions);
    function* syncSubscriptions (): Saga {
      const newChannels = yield select((state: State) => state.eventSource.channels);
      const subscribe = difference(newChannels, channels);
      const unsubscribe = difference(channels, newChannels);
      console.log(channels, '->', newChannels, '+', subscribe, '-', unsubscribe);
      const resp = yield call(postJson, `${process.env.BACKEND_URL}/Events/${streamKey}`, {subscribe, unsubscribe});
      if ('error' in resp) {
        console.log("Error updating subscriptions:", resp);
        return;
      }
      if (resp.result === true) {
        channels = newChannels;
      }
    }
    const events = yield call(channelOfEventSource, `${process.env.BACKEND_URL}/Events/${streamKey}`);
    while (true) {
      let event : Message | END = yield take(events);
      console.log('event', event);
      if ('type' in event && event.type === END.type) {
        console.log('event stream has ended');
        break; // XXX should re-open the event stream?
      }
      if ('channel' in event) {
        // XXX do not leak channel to client?
        // event.channel == 'team'
        // event.channel == 'contest'
        if (/^contest:/.test(event.channel)) {
          let md = /chain (.*) created/.exec(event.payload);
          if (md) {
            yield put(actionCreators.chainCreated(md[1]));
            continue;
          }
          md = /chain (.*) deleted/.exec(event.payload);
          if (md) {
            yield put(actionCreators.chainDeleted(md[1]));
            continue;
          }
        } else {
          let md = /^game:(.*)$/.exec(event.channel);
          if (md !== null) {
            const gameKey = md[1];
            // event.payload === "block …"
            md = /^block (.*)$/.exec(event.payload);
            if (md != null) {
              const blockHash: string = md[1];
              const block: Block = yield call(loadBlock, blockHash);
              yield put(actionCreators.blockLoaded(blockHash, block));
            }
            const {game, blocks} = yield call(loadGameHead, gameKey);
            yield put(actionCreators.gameLoaded(gameKey, game, blocks));
          }
          continue;
        }
      }
    }
  });

}

function difference(xs: string[], ys: string[]): string[] {
  const result = [];
  for (let x of xs) {
    if (ys.indexOf(x) === -1) {
      result.push(x);
    }
  }
  return result;
}

function inc(n: number) { return n + 1; }
function flushSelectorCache(state: State): State {
  return update(state, {
    backend: {generation: {$apply: inc}},
    entities: {$set: applyOptimisticChanges(state.backend.pristineEntities, state.backend.optimisticChanges)}
  });
}

function updateEntities (entities: PreEntities, changes: {[key: string]: object}): PreEntities {
  let result : PreEntities = entities;
  for (let key of Object.keys(changes)) {
    const value = changes[key];
    const {collection, facet, id} = splitEntityKey(key);
    if (collection in result) {
      const col = <keyof PreEntities>collection;
      if (id in result[col]) {
        result = update(result, {[collection]: {[id]: {[facet]: {$set: value}}}});
      } else {
        result = update(result, {[collection]: {[id]: {$set: {[facet]: value}}}});
      }
    } else {
      console.log('update for unknown collection', collection, facet, id, value);
    }
  }
  return result;
}

export function optimisticChange<K extends Collection>(collection: K, id: string, change: OptimisticChange<K>['change']): OptimisticChange<K> {
  return {collection, id, change};
}

function applyOptimisticChanges (entities: PreEntities, items: OptimisticChange<Collection>[]) {
  for (let item of items) {
    const {collection, id, change} = item;
    entities = update(entities, {[collection]: {[id]: {'!': {$set: change}}}});
  }
  return entities;
}

function splitEntityKey(key: string) : {collection: string, facet: string, id: string} {
  const [cf, id] = key.split(" ");
  const [collection, facet] = cf.split("#");
  return {collection, facet: facet || "", id};
}

function fetchJson (url: string) {
  const controller = new AbortController();
  const promise = new Promise(function (resolve, reject) {
    const init : RequestInit = {
      cache: "no-cache",
      credentials: "include",
      signal: controller.signal,
    };
    fetch(url, init).then(function (req) {
      const ct = req.headers.get('Content-Type') || '';
      if (!/^application\/json/.test(ct)) {
        req.text().then(function (body) {
          reject(new Error("unexpected response from server: " + body));
        }).catch(function (err) {
          reject(new Error("failed to read server response: " + err));
        });
        return;
      }
      req.json().then(resolve).catch(function (err) {
        reject(new Error("bad response from server: " + err));
      });
    }).catch(reject);
  });
  (promise as any)[CANCEL] = function () {
    controller.abort();
  };
  return promise;
}

function postJson (url: string, body: any) {
  const controller = new AbortController();
  const promise = new Promise(function (resolve, reject) {
    const init : RequestInit = {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "include",
      signal: controller.signal,
      headers: {
        "X-Csrf-Token": (<any>window).csrfToken
      },
      body: JSON.stringify(body),
    };
    fetch(url, init).then(function (req) {
      const ct = req.headers.get('Content-Type') || '';
      if (!/^application\/json/.test(ct)) {
        req.text().then(function (body) {
          reject(new Error("unexpected response from server: " + body));
        }).catch(function (err) {
          reject(new Error("failed to read server response: " + err));
        });
        return;
      }
      req.json().then(resolve).catch(function (err) {
        reject(new Error("bad response from server: " + err));
      });
    }).catch(reject);
  });
  (promise as any)[CANCEL] = function () {
    controller.abort();
  };
  return promise;
}

export function channelOfEventSource (url: string) : Channel<object> {
  const source = new EventSource(url);
  // TODO: save first origin and check that subsequent messages match
  return eventChannel(function (emitter) {
    // source.addEventListener('open', function (e) {…}, false);
    source.addEventListener('message', function (e: Event) {
      const msg = e as MessageEvent;
      try {
        emitter(JSON.parse(msg.data));
      } catch (ex) {
        emitter(END);
      }
    }, false);
    source.addEventListener('error', function () {
      emitter(END);
    }, false);
    return function () {
      source.close();
    };
  });
}

/* Arguments to call is invariant, otherwise this would be
   (saga: Saga, optimisticChanges?: OptimisticChange<Collection>[]) */
export function* monitorBackendTask (saga: any, optimisticChanges?: any): Saga {
  const taskRef = {
    task: undefined,
  };
  yield put(actionCreators.clearError());
  yield put(actionCreators.backendTaskStarted(taskRef, optimisticChanges || []));
  /* TODO: save entities, enabling the saga to make eager updates while being
     able to revert if the backend returns an error. */
  taskRef.task = yield fork(function* () {
    try {
      return yield call(saga);
    } catch (ex) {
      AppToaster.show({message: ex.toString()});
      /* TODO: if an error happened before getting an error-free response from
         the backend, revert to the saved entities. */
      yield put(actionCreators.backendTaskFailed(taskRef, ex.toString()));
    } finally {
      yield put(actionCreators.backendTaskDone(taskRef));
    }
  });
}

function* backendGet (path: string) {
  const response = yield call(fetchJson, `${process.env.BACKEND_URL}/${path}`);
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.entities) {
    yield put(actionCreators.backendEntitiesLoaded(response.entities));
  }
  return response.result;
}

function* backendPost (path: string, body: object | null) {
  const response = yield call(postJson, `${process.env.BACKEND_URL}/${path}`, body);
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.entities) {
    yield put(actionCreators.backendEntitiesLoaded(response.entities));
  }
  return response.result;
}

export function* getUser (): Saga {
  // result: {userId: string}
  return yield call(backendGet, 'User');
}

export function* loadAuthenticatedUserLanding (): Saga {
  // result: {userId: string, contestIds: string[]}
  return yield call(backendGet, `AuthenticatedUserLanding`);
}

export function* loadContest (contestId: string): Saga {
  // result: {}
  return yield call(backendGet, `Contests/${contestId}`);
}

export function* loadContestTeam (contestId: string): Saga {
  // result: {teamId: string | null}
  return yield call(backendGet, `Contests/${contestId}/Team`);
}

export function* createTeam (contestId: string, teamName: string): Saga {
  // result: {teamId: string | null}
  return yield call(backendPost, `Contests/${contestId}/CreateTeam`, {teamName});
}

export function* joinTeam (contestId: string, accessCode: string): Saga {
  // result: {teamId: string | null}
  return yield call(backendPost, `Contests/${contestId}/JoinTeam`, {accessCode});
}

export function* leaveTeam (teamId: string): Saga {
  // result: {}
  return yield call(backendPost, `Teams/${teamId}/Leave`, {});
}

export function* updateTeam (teamId: string, arg: {isOpen?: boolean, publicKey?: string}): Saga {
  return yield call(backendPost, `Teams/${teamId}/Update`, arg);
}

export function* changeTeamAccessCode (teamId: string): Saga {
  // result: {}
  return yield call(backendPost, `Teams/${teamId}/AccessCode`, null);
}

export function* loadContestChains (contestId: string, filters: ChainFilters): Saga {
  const search = qs.stringify({contestId, ...filters});
  // result: {chainIds: string[]}
  return yield call(backendGet, `Chains?${search}`);
}

export function* loadGameHead (gameKey: string): Saga {
  return yield call(backendGet, `Games/${gameKey}`);
}

export function* loadGamePage (gameKey: string, page: number): Saga {
  return yield call(backendGet, `Games/${gameKey}/Index/${page}`);
}

export function* loadChain (chainId: string): Saga {
  // result: {}
  return yield call(backendGet, `Chains/${chainId}`);
}

export function* forkChain (chainId: string): Saga {
  return yield call(backendPost, `Chains/${chainId}/Fork`, null);
}

export function* deleteChain (chainId: string): Saga {
  return yield call(backendPost, `Chains/${chainId}/Delete`, null);
}

export function* restartChain (chainId: string): Saga {
  return yield call(backendPost, `Chains/${chainId}/Restart`, null);
}

export function* loadBlock (hash: string): Saga {
  const resp: Response = yield call(fetch, `${process.env.BLOCKSTORE_URL}/${hash}/block.json`);
  const data: object = yield call([resp, resp.json]);
  return {hash, ...data};
}
