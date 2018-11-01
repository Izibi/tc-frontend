
import * as Immutable from 'immutable';
import {eventChannel, Channel, END, CANCEL} from "redux-saga";
import {call, fork, put, select, take, takeEvery, takeLatest} from "redux-saga/effects";
import update from 'immutability-helper';
import * as qs from 'querystring';

import {Saga, actionCreators, Actions, ActionTypes, AppToaster, State} from "../app";
import {without, difference} from "../utils";

import {ChainFilters, BlockData, Block, BlockIndexEntry, ScoreBoard, PlayerRanking} from '../types';
import {BackendState, PreEntities, PreGameInfo, OptimisticChange, Collection, GameHead} from "./types";
import * as _selectors from "./selectors";

export {BackendState} from "./types";
export {default as BackendFeedback} from "./Feedback";
export const selectors = _selectors;

export class LoggedOutError extends Error {}

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
    loggedOut: false,
    generation: 0,
    lastError: undefined,
    tasks: [],
    pristineEntities: initialEntities,
    entities: initialEntities,
    optimisticChanges: [],
    games: Immutable.Map(),
    blocks: Immutable.Map(),
  },
  eventSource: {
    key: "",
    channels: [],
  },
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
      const {gameKey, game, blocks: newBlocks, players, scores} = action.payload;
      const prevGI : PreGameInfo | undefined = state.backend.games.get(gameKey);
      let blocks : Immutable.List<BlockIndexEntry> = prevGI === undefined ? Immutable.List() : prevGI.blocks;
      if (newBlocks !== null) {
        for (let block of newBlocks) {
          blocks = blocks.set(block.sequence, block);
        }
      }
      state = update(state, {backend: {
        games: {$apply: (games: Immutable.Map<string, PreGameInfo>) =>
            games.set(gameKey, {game, blocks, players})},
        blocks: setOrUpdateBlockData(game.lastBlock,
              {scores: {$set: scores ? parseScores(scores) : undefined}}),
      }});
      return flushSelectorCache(state);
    }
    case ActionTypes.GAME_INDEX_PAGE_LOADED: {
      const {gameKey, blocks: newBlocks} = action.payload;
      const prevGI : PreGameInfo | undefined = state.backend.games.get(gameKey);
      let blocks : Immutable.List<BlockIndexEntry> = prevGI === undefined ? Immutable.List() : prevGI.blocks;
      if (newBlocks !== null) {
        for (let block of newBlocks) {
          blocks = blocks.set(block.sequence, block);
        }
      }
      state = update(state, {backend: {
        games: {$apply: (games: Immutable.Map<string, PreGameInfo>) =>
            games.update(gameKey, gi => update(gi, {blocks: {$set: blocks}}))}
      }});
      return flushSelectorCache(state);
    }

    case ActionTypes.BLOCK_LOADED: {
      const {hash, block} = action.payload;
      state = update(state, {backend: {
        blocks: setOrUpdateBlockData(hash, {block: {$set: block}}),
      }});
      return flushSelectorCache(state);
    }
    case ActionTypes.BLOCK_SCORES_LOADED: {
      const {hash, scores} = action.payload;
      state = update(state, {backend: {
        blocks: setOrUpdateBlockData(hash, {scores: {$set: scores}}),
      }});
      return flushSelectorCache(state);
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

    case ActionTypes.BACKEND_LOGGED_OUT: {
      return update(state, {backend: {loggedOut: {$set: true}}});
    }

  }
  return state;
}

type Message = {
  channel: string,
  payload: string,
}

type ApiResponse<T> = {result?: T, entities?: PreEntities} | {error: string, details?: string}

class DisconnectedError extends Error {}

export function* saga(): Saga {
  yield takeLatest(ActionTypes.USER_LOGGED_IN, function* (): Saga {
    while (true) {
      try {
        yield call(connectEventStream);
      } catch (ex) {
        if (ex instanceof DisconnectedError) {
          AppToaster.show({message: "Disconnected from server, attempting to recover."});
          continue;
        }
        AppToaster.show({message: "Fatal event stream error, please reload the page."});
        return;
      }
    }
  });
}

function* connectEventStream(): Saga {
  const resp : ApiResponse<string> = yield call(postJson, `${process.env.BACKEND_URL}/Events`, null);
  if ('error' in resp) {
    console.log('failed to create event stream', resp);
    return;
  }
  const streamKey = resp.result;
  let channels : string[] = [];
  const events: Channel<object> = yield call(channelOfEventSource, `${process.env.BACKEND_URL}/Events/${streamKey}`);
  function* syncSubscriptions (): Saga {
    const newChannels = yield select((state: State) => state.eventSource.channels);
    const subscribe = difference(newChannels, channels);
    const unsubscribe = difference(channels, newChannels);
    const resp: ApiResponse<boolean> = yield call(postJson, `${process.env.BACKEND_URL}/Events/${streamKey}`, {subscribe, unsubscribe});
    if ('error' in resp) {
      if (resp.error === 'disconnected') {
        throw new DisconnectedError();
      }
      throw new Error(resp.error);
    }
    if (resp.result === true) {
      channels = newChannels;
    }
  }
  yield takeEvery(ActionTypes.EVENTSOURCE_SUBS_CHANGED, syncSubscriptions);
  yield call(syncSubscriptions);
  while (true) {
    let event : Message | END = yield take(events);
    // console.log('event', event);
    if ('type' in event && event.type === END.type) {
      throw new DisconnectedError();
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
          const {game, blocks, players, scores}: GameHead = yield call(loadGameHead, gameKey);
          yield put(actionCreators.gameLoaded(gameKey, game, blocks, players, scores));
        }
        continue;
      }
    }
  }

}
function inc(n: number) { return n + 1; }
function flushSelectorCache(state: State): State {
  return update(state, {
    backend: {
      generation: {$apply: inc},
      entities: {$set: applyOptimisticChanges(state.backend.pristineEntities, state.backend.optimisticChanges)}
    },
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

function fetchJson (url: string, options: {cache?: boolean}) {
  const controller = new AbortController();
  const promise = new Promise(function (resolve, reject) {
    const init : RequestInit = {
      credentials: "include",
      signal: controller.signal,
    };
    if (!options.cache) {
      init.cache = "no-cache";
    }
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
        "X-Csrf-Token": (<any>window).csrfToken,
        "Content-Type": "application/json",
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
  taskRef.task = yield fork(function* () {
    try {
      return yield call(saga);
    } catch (ex) {
      if (ex instanceof LoggedOutError) {
        AppToaster.show({message: "Your session has expired, please reload the page."});
      }
      AppToaster.show({message: ex.toString()});
      yield put(actionCreators.backendTaskFailed(taskRef, ex.toString()));
    } finally {
      yield put(actionCreators.backendTaskDone(taskRef));
    }
  });
}

function* backendGet<T> (path: string, options?: {cache: boolean}): Saga {
  const response: ApiResponse<T> = yield call(fetchJson, `${process.env.BACKEND_URL}/${path}`, options || {});
  if ('error' in response) {
    if (response.error === "you don't exist") {
      throw new LoggedOutError();
    }
    throw new Error(response.error);
  }
  if (response.entities !== undefined) {
    yield put(actionCreators.backendEntitiesLoaded(response.entities));
  }
  return response.result;
}

function* backendPost<T> (path: string, body: object | null): Saga {
  const response: ApiResponse<T> = yield call(postJson, `${process.env.BACKEND_URL}/${path}`, body);
  if ('error' in response) {
    if (response.error === "you don't exist") {
      throw new LoggedOutError();
    }
    throw new Error(response.error);
  }
  if (response.entities !== undefined) {
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
  return yield call(backendGet, `Games/${gameKey}`, {cache: true});
}

export function* loadGamePage (gameKey: string, page: number): Saga {
  return yield call(backendGet, `Games/${gameKey}/Index/${page}`, {cache: true});
}

export function* loadChain (chainId: string): Saga {
  // result: {}
  return yield call(backendGet, `Chains/${chainId}`);
}

export function* forkChain (chainId: string, title: string): Saga {
  return yield call(backendPost, `Chains/${chainId}/Fork`, {title});
}

export function* deleteChain (chainId: string): Saga {
  return yield call(backendPost, `Chains/${chainId}/Delete`, null);
}

export function* restartChain (chainId: string): Saga {
  return yield call(backendPost, `Chains/${chainId}/Restart`, null);
}

export function* updateChain (chainId: string, arg: {statusId?: string}): Saga {
  return yield call(backendPost, `Chains/${chainId}/Update`, arg);
}

export function* loadBlock (hash: string): Saga {
  const resp: Response = yield call(fetch, `${process.env.BLOCKSTORE_URL}/${hash}/block.json`);
  const block: Block = yield call([resp, resp.json]);
  return block;
}

export function* loadBlockScores (hash: string): Saga {
  const resp = yield call(fetch, `${process.env.BLOCKSTORE_URL}/${hash}/scores.txt`);
  return parseScores(yield call([resp, resp.text]));
}

function parseScores(str: string): ScoreBoard {
  const lines = str.split("\n");
  const [nbPlayers, maxScore] = lines[0].split(" ").map(s => parseInt(s));
  const rankings = new Array<PlayerRanking>(nbPlayers)
  for (let i = 0; i < nbPlayers; i++) {
    const [score, rank] = lines[1 + i].split(" ").map(s => parseInt(s));
    rankings[i] = {score, rank};
  }
  return {maxScore, rankings};
}

function setOrUpdateBlockData (hash: string, changes: object) {
  return {
    $apply: (blocks: Immutable.Map<string, BlockData>) =>
      blocks.has(hash)
        ? blocks.update(hash, bd => update(bd, changes))
        : blocks.set(hash, update(<BlockData>{hash}, changes))
  };
}
