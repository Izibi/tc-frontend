
import {Effect, CANCEL} from 'redux-saga';
import {fork, call, put} from 'redux-saga/effects';

import {without} from '../utils';
import {actionCreators, Actions, ActionTypes, AppToaster, State} from '../app';

import {Entities, EntitiesUpdate} from './types';
import * as _selectors from './selectors';
import {loadedEntity} from './entities';

export {EntityMap, BackendState, EntitiesUpdate} from './types';
export {default as BackendFeedback} from './Feedback';
export const selectors = _selectors;

type Saga = IterableIterator<Effect>

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
      return {...state, contestId, teamId: 'unknown'};
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

export type UniEntities = {[collection: string]: {[id: string]: object}}

function updateEntities (entities: UniEntities, update: EntitiesUpdate): UniEntities {
  const result : UniEntities = {};
  for (let key of Object.keys(update)) {
    const value = update[key];
    // Split key at first '.' yielding (collection, id).
    const {collection, id} = splitEntityKey(key);
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
      /* Otherwise, store the (id, value) pair in the collection. */
      result[collection][id] = loadedEntity(id, value);
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

function splitEntityKey(key: string) : {collection: string, id: string} {
  const [collection, ...idParts] = key.split('.');
  return {collection, id: idParts.join('.')};
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
    fetch(url, {credentials: 'include' /* XXX X-Csrf-Token */, signal: controller.signal}).then(function (req) {
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
  taskRef.task = yield fork(function* () {
    try {
      return yield call(saga);
    } catch (ex) {
      AppToaster.show({message: ex.toString()});
      yield put(actionCreators.backendTaskFailed(taskRef, ex.toString()));
    } finally {
      yield put(actionCreators.backendTaskDone(taskRef));
    }
  });
}

export function* getUser (): Saga {
  const response : null | {userId: string} = yield call(fetchJson, `${process.env.BACKEND_URL}/User`);
  return response ? response.userId : undefined;
}

export function* loadAuthenticatedUserLanding (): Saga {
  const {result, entities} = yield call(fetchJson, `${process.env.BACKEND_URL}/AuthenticatedUserLanding`);
  if (entities) {
    yield put(actionCreators.backendEntitiesLoaded(entities));
  }
  return result; // {userId: string, contestIds: string[]}
}

export function* loadContest (contestId: string): Saga {
  yield call(fetchJson, `${process.env.BACKEND_URL}/Contests/${contestId}`);
}
