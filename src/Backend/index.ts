
import {Effect, CANCEL} from "redux-saga";
import {fork, call, put} from "redux-saga/effects";

import {actionCreators, Actions, ActionTypes, AppToaster, State} from "../app";
import {without} from "../utils";

import {Entity} from '../types';
import {Entities, EntitiesUpdate} from "./types";
import * as _selectors from "./selectors";
import {loadedEntity, updateEntity} from "./entities";

export {EntityMap, BackendState, EntitiesUpdate} from "./types";
export {default as BackendFeedback} from "./Feedback";
export const selectors = _selectors;

type Saga = IterableIterator<Effect>

var csrfToken : string = "";

// const keysOf = (Object.keys as <T>(o: T) => (keyof T)[]);

export function backendReducer (state: State, action: Actions): State {
  switch (action.type) {

    case ActionTypes.BACKEND_TASKS_CLEARED: {
      return {...state, backend: {generation: 0, tasks: [], lastError: undefined}};
    }
    case ActionTypes.BACKEND_TASK_STARTED: {
      const {task} = action.payload;
      return {...state, backend: {
        ...state.backend,
        tasks: [...state.backend.tasks, task]
      }};
    }
    case ActionTypes.BACKEND_TASK_FAILED: {
      const {task, error} = action.payload;
      let {backend} = state;
      let tasks = without(backend.tasks, task);
      return {...state, backend: {...backend, tasks, lastError: error}};
    }
    case ActionTypes.BACKEND_TASK_DONE: {
      const {task} = action.payload;
      let {backend} = state;
      let tasks = without(backend.tasks, task);
      return {...state, backend: {...backend, tasks}};
    }

    case ActionTypes.BACKEND_ENTITIES_LOADED: {
      const entities = <Entities>updateEntities(state.entities, action.payload.entities);
      return {
        ...state,
        backend: {...state.backend, generation: state.backend.generation + 1},
        entities
      };
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
    case ActionTypes.CHAIN_LIST_CHANGED: {
      let {chainIds} = action.payload;
      return {...state, chainIds};
    }

  }
  return state;
}

export type UniEntities = {[collection: string]: {[id: string]: Entity<object>}}

function updateEntities (entities: UniEntities, update: EntitiesUpdate): UniEntities {
  const result : UniEntities = {};
  for (let key of Object.keys(update)) {
    const value = update[key];
    const {collection, facet, id} = splitEntityKey(key);
    // Ensure the collection has been copied.
    if (!(collection in result)) {
      result[collection] = {}; // Object.assign({}, entities[collection]);
    }
    if (value == null) {
      /* If value is null, purge from the collection all bindings matching the
         pattern given by `id`. */
      const ids = matchIds(id, Object.keys(result[collection]));
      for (let id of ids) {
        delete result[collection][id];
      }
    } else {
      if (facet) {
        /* Merge facet. */
        result[collection][id] = updateEntity(result[collection][id], value);
      } else {
        /* Base facet, store the (id, value) pair in the collection. */
        result[collection][id] = loadedEntity(id, value);
      }
    }
  }
  /* Copy over any unchanged collections. */
  for (let collection of Object.keys(entities)) {
    if (!(collection in result)) {
      result[collection] = entities[collection];
    }
  }
  return result;
}

function splitEntityKey(key: string) : {collection: string, facet: string | undefined, id: string} {
  const [cf, id] = key.split(" ");
  const [collection, facet] = cf.split("#");
  return {collection, facet, id};
}

function matchIds(pattern: string, ids: string[]) {
  const result : string[] = [];
  for (let id of ids) {
    if (matchId(pattern, id)) {
      result.push(id);
    }
  }
  return result;
}

function matchId(pattern: string, id: string) {
  return true; // TODO: implement
}

/*
function loadEntities<T extends {id: string}>(values: T[]) : EntityMap<T> {
  const result: EntityMap<T> = {};
  for (let value of values) {
    const {id} = value;
    result[id] = loadedEntity(id, value);
  }
  return result;
}
function loadEntities2<T>(values: T[], getId: (value: T) => string) : EntityMap<T> {
  const result: EntityMap<T> = {};
  for (let value of values) {
    const id = getId(value);
    result[id] = loadedEntity(id, value);
  }
  return result;
}
*/

function fetchJson (url: string) {
  const controller = new AbortController();
  const promise = new Promise(function (resolve, reject) {
    const init : RequestInit = {
      cache: "no-cache",
      credentials: "include",
      signal: controller.signal,
    };
    fetch(url, init).then(function (req) {
      req.json().then(resolve).catch(reject);
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
        "X-Csrf-Token": csrfToken
      },
      body: JSON.stringify(body),
    };
    fetch(url, init).then(function (req) {
      req.json().then(resolve).catch(reject);
    }).catch(reject);
  });
  (promise as any)[CANCEL] = function () {
    controller.abort();
  };
  return promise;
}

export function* monitorBackendTask (saga: any): Saga {
  const taskRef = {
    task: undefined,
  };
  yield put(actionCreators.backendTaskStarted(taskRef));
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
  if (response.csrfToken) {
    if (csrfToken !== response.csrfToken) {
      console.log('Received CSRF token', response.csrfToken);
    }
    csrfToken = response.csrfToken;
  }
  if (response.error) {
    AppToaster.show({className: 'error', message: response.error});
    throw new Error('API error');
  }
  if (response.entities) {
    yield put(actionCreators.backendEntitiesLoaded(response.entities));
  }
  return response.result;
}

function* backendPost (path: string, body: object | null) {
  const response = yield call(postJson, `${process.env.BACKEND_URL}/${path}`, body);
  console.log(response);
  if (response.error) {
    AppToaster.show({className: 'error', message: response.error});
    throw new Error('API error');
  }
  if (response.entities) {
    yield put(actionCreators.backendEntitiesLoaded(response.entities));
  }
  return response.result;
}

export function* getUser (): Saga {
  // result: {userId: string, csrfToken: string}
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

export function* changeTeamAccessCode (teamId: string): Saga {
  // result: {}
  return yield call(backendPost, `Teams/${teamId}/AccessCode`, null);
}
