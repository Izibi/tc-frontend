
import {Effect} from 'redux-saga';
import {fork, call, put, select, cancelled} from 'redux-saga/effects';
import {delay} from 'redux-saga';
import * as moment from 'moment';

import {without} from '../utils';
import {actionCreators, Actions, ActionTypes, AppToaster, State} from '../app';
import {Contest, Task, TaskResource, ContestPeriod, Team} from '../types';

export {BackendState} from './types';
export {default as BackendFeedback} from './Feedback';

type Saga = IterableIterator<Effect>

const testTasks: Task[] = [
  {
    id: "1",
    title: "task 1",
  }
];
const testContestPeriod : ContestPeriod = {
  id: "1",
  title: "day 1",
  day_number: 1,
  chain_election_at: moment('2018-09-05T18:00'),
  main_chain: {
    title: "day 1",
    description: "description",
    interface: "",
    implementation: "",
  }
};
const testContests : Contest[] = [
  {
    id: "1",
    title: "Contest name",
    description: "Lorem ipsum blah blah",
    logo_url: "",
    registration_open: true,
    registration_closes_at: moment('2018-09-05'),
    starts_at: moment('2018-09-05'),
    ends_at: moment('2018-09-10'),
    task: testTasks[0],
    current_period: testContestPeriod,
  }
];
const testTaskResources: {task_id: string, resources: TaskResource[]}[] = [
  {
    task_id: "1",
    resources: [
      {title: "Task description", description: "This section describes the task", html: "Task description goes <p>here</p>..."},
      {title: "Commands", description: "", html: "Commands description goes here…"},
      {title: "API", description: "", url: "about:blank#2"},
      {title: "Examples", description: "", url: "about:blank#3"},
      {title: "OCaml basics", description: "", url: "about:blank#4"},
    ]
  }
];
const team1 : Team = {
  id: "1",
  name: "CodersPlanet",
  access_code: "ab824XbsI9",
  is_open: true,
  is_locked: false,
  members: [
    {
      user: {
        id: "1",
        username: "Test User",
        firstname: "Test",
        lastname: "User",
      },
      is_creator: true,
      member_since: moment('2018-09-05T08:00'),
    }
  ]
};
const testTeams = [
  {contest_id: "1", user_id: "1", team: team1}
];

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

    case ActionTypes.CONTEST_LIST_LOADED: {
      const {contests} = action.payload;
      return {...state, contests};
    }
    case ActionTypes.CONTEST_LOADED: {
      const {contest} = action.payload;
      /* Clear task and task_resources if the task changes. */
      let task = state.task;
      let task_resources = state.task_resources;
      if (task && task.id !== contest.task.id) {
        task = contest.task;
        task_resources = undefined;
      }
      return {...state, contest, task, task_resources, team: 'unknown'};
    }
    case ActionTypes.TASK_LOADED: {
      let {task} = action.payload;
      /* Clear task_resources if the task changes. */
      let task_resources = state.task_resources;
      if (state.task && task.id !== state.task.id) {
        task_resources = undefined;
      }
      return {...state, task, task_resources};
    }
    case ActionTypes.TASK_RESOURCES_LOADED: {
      const {resources} = action.payload;
      return {...state, task_resources: resources};
    }
    case ActionTypes.TEAM_LOADED: {
      let {team} = action.payload;
      return {...state, team};
    }

  }
  return state;
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

export function* loadContests (): Saga {
  let contests: Contest[] = yield select((state: State) => state.contests);
  if (!contests) {
    yield call(delay, 500);
    contests = testContests;
    yield put(actionCreators.contestListLoaded(contests));
  }
  return contests;
}

export function* loadContest (contestId: string) : Saga {
  let contest: Contest | undefined = yield select((state: State) => state.contest);
  if (!contest || contest.id !== contestId) {
    const contests: Contest[] | undefined = yield select((state: State) => state.contests);
    if (contests) {
      contest = contests.find(contest => contest.id === contestId);
    }
    if (!contest) {
      yield call(delay, 500);
      contest = testContests.find(contest => contest.id === contestId);
    }
    if (!contest) throw new Error("contest failed to load");
    // TODO
    yield put(actionCreators.contestLoaded(contest));
  }
  return contest;
}

export function* loadTask (taskId: string) : Saga {
  let task: Task | undefined = yield select((state: State) => state.task);
  if (!task || task.id !== taskId) {
    yield call(delay, 500);
    task = testTasks.find(task => task.id === taskId);
    if (!task) throw new Error("task failed to load");
    yield put(actionCreators.taskLoaded(task));
  }
  return task;
}

export function* loadTaskResources () : Saga {
  let taskResources: TaskResource[] | undefined = yield select((state: State) => state.task_resources);
  if (!taskResources) {
    const taskId: string = yield select((state: State) => {
      if (state.contest) return state.contest.task.id;
      if (state.task) return state.task.id;
      throw new Error("cannot determine what task resources to load");
    });
    yield call(delay, 500);
    const item = testTaskResources.find(item => item.task_id === taskId);
    if (!item) throw new Error("task resources failed to load");
    yield put(actionCreators.taskResourcesLoaded(item.resources));
  }
  return taskResources;
}

export function* loadTeam (userId: string, contestId: string) : Saga {
  let team: Team | 'unknown' | undefined = yield select((state: State) => state.team);
  if (team === 'unknown') {
    yield call(delay, 500);
    const item = testTeams.find(item => item.user_id === userId && item.contest_id === contestId);
    if (!item) throw new Error("team failed to load");
    team = item.team;
    yield put(actionCreators.teamLoaded(team));
  }
  return team;
}

