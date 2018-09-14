
import {Effect} from 'redux-saga';
import {fork, call, put, cancelled} from 'redux-saga/effects';
import {delay} from 'redux-saga';

import {without} from '../utils';
import {actionCreators, Actions, ActionTypes, AppToaster, State} from '../app';

import {IdMap, Entities, EntitiesUpdate, User, Team, TeamMember, Contest, Task, TaskResource, ContestPeriod, Chain} from './types';
import * as _selectors from './selectors';

export {IdMap, BackendState, EntitiesUpdate} from './types';
export {default as BackendFeedback} from './Feedback';
export const selectors = _selectors;

type Saga = IterableIterator<Effect>

const keysOf = (Object.keys as <T>(o: T) => (keyof T)[]);

const testUsers : IdMap<User> = {
  "1": {
    id: "1",
    username: "alice",
    firstname: "Alice",
    lastname: "Doe"
  },
  "2": {
    id: "2",
    username: "bob",
    firstname: "Bob",
    lastname: "Smith"
  },
  "3": {
    id: "3",
    username: "Test User",
    firstname: "Test",
    lastname: "User",
  },
};
const testContests: IdMap<Contest> = {
  "1": {
    id: "1",
    title: "Contest name",
    description: "Lorem ipsum blah blah",
    logo_url: "",
    registration_open: true,
    registration_closes_at: '2018-09-05',
    starts_at: '2018-09-05',
    ends_at: '2018-09-10',
    task_id: '1',
    current_period_id: '1',
  }
};
const testTasks: IdMap<Task> = {
  "1": {
    id: "1",
    title: "task 1",
  }
};
const testContestPeriods : IdMap<ContestPeriod> = {
  "1": {
    id: "1",
    title: "day 1",
    day_number: 1,
    chain_election_at: '2018-09-05T18:00',
    main_chain_id: "1",
  }
};
const testChains : IdMap<Chain> = {
  "1": {
    id: "1",
    title: "day 1",
    description: "description",
    interface: "",
    implementation: "",
    current_game_key: "",
  }
};

const testTaskResources: IdMap<TaskResource> = {
  "1": {id: "1", task_id: "1", rank: 1, title: "Task description", description: "This section describes the task", url: null, html: "Task description goes <p>here</p>..."},
  "2": {id: "2", task_id: "1", rank: 2, title: "Commands", description: "", url: null, html: "Commands description goes here…"},
  "3": {id: "3", task_id: "1", rank: 3, title: "API", description: "", url: "about:blank#2", html: null},
  "4": {id: "4", task_id: "1", rank: 4, title: "Examples", description: "", url: "about:blank#3", html: null},
  "5": {id: "5", task_id: "1", rank: 5, title: "OCaml basics", description: "", url: "about:blank#4", html: null},
};
const testTeams : IdMap<Team> = {
  "1": {
    id: "1",
    created_at: "2018-09-01",
    access_code: "ab824XbsI9",
    contest_id: "1",
    is_open: true,
    is_locked: false,
    name: "CodersPlanet",
    public_key: "sCnGFS3n7TX9Y9dZ2ZQ63/rLtB02iEGlySRDSg/DgcM=.ed25519",
  }
};
const testTeamMembers : IdMap<TeamMember> = {
  "1 1": {
    team_id: "1",
    user_id: "1",
    is_creator: true,
    joined_at: '2018-09-05T08:00',
  }
};

export function backendReducer (state: State, action: Actions): State {
  switch (action.type) {

    case ActionTypes.BACKEND_TASKS_CLEARED: {
      return {...state, backend: {tasks: [], lastError: undefined}};
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
      const entities = updateEntities(state.entities, action.payload.entities);
      return {...state, entities};
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

function updateEntities (entities: Entities, update: EntitiesUpdate): Entities {
  const result: Entities = {...entities};
  for (let key of keysOf(update)) {
    result[key] = Object.assign({}, entities[key], update[key]);
  }
  return result;
}

export function* monitorBackendTask (saga: any): Saga {
  const taskRef = {
    task: undefined,
  };
  yield put(actionCreators.backendTaskStarted(taskRef));
  taskRef.task = yield fork(function* () {
    try {
      yield call(saga);
    } catch (ex) {
      if (!(yield cancelled())) {
        AppToaster.show({message: ex.toString()});
        yield put(actionCreators.backendTaskFailed(taskRef, ex.toString()));
      }
    }
    yield put(actionCreators.backendTaskDone(taskRef));
  });
}

export function* loadUser (id: string): Saga {
  yield call(delay, 500);
  yield put(actionCreators.backendEntitiesLoaded({
    users: testUsers
  }));
}

export function* loadContestList (): Saga {
  yield call(delay, 500);
  yield put(actionCreators.backendEntitiesLoaded({
    contests: testContests,
    contestPeriods: testContestPeriods,
    tasks: testTasks,
    taskResources: testTaskResources,
    chains: testChains,
  }));
  return ["1"];
}

export function* loadContest (id: string) : Saga {
  yield call(delay, 500);
  yield put(actionCreators.backendEntitiesLoaded({
    contests: testContests,
    tasks: testTasks,
    taskResources: testTaskResources,
    contestPeriods: testContestPeriods,
    chains: testChains,
  }));
}

export function* loadTeam (userId: string, contestId: string) : Saga {
  yield call(delay, 500);
  yield put(actionCreators.backendEntitiesLoaded({
    contests: testContests,
    tasks: testTasks,
    taskResources: testTaskResources,
    contestPeriods: testContestPeriods,
    chains: testChains,
    teams: testTeams,
    teamMembers: testTeamMembers,
  }));
  return "1";
}

export function* loadContestChains (contestId: string, filters: object) : Saga {
  yield call(delay, 500);
  yield put(actionCreators.backendEntitiesLoaded({
    contests: testContests,
    tasks: testTasks,
    taskResources: testTaskResources,
    contestPeriods: testContestPeriods,
    chains: testChains,
  }));
  return ["1"];
}
