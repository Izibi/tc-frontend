
import {Effect} from 'redux-saga';
import {fork, call, put, select, cancelled} from 'redux-saga/effects';
import {delay} from 'redux-saga';
import * as moment from 'moment';

import {without} from '../utils';
import {actionCreators, Actions, ActionTypes, AppToaster, State} from '../app';
import {Contest, Task, TaskResource} from '../types';

export {BackendState} from './types';
export {default as BackendFeedback} from './Feedback';

const testContests : Contest[] = [
  {
    id: "1",
    title: "Contest name",
    description: "Lorem ipsum blah blah",
    logo_url: null,
    registration_open: true,
    registration_closes_at: moment('2018-09-05'),
    starts_at: moment('2018-09-05'),
    ends_at: moment('2018-09-10'),
    task_id: "1",
  }
];
const testTasks: Task[] = [
  {
    id: "1",
    title: "task 1",
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
  }
  return state;
}

export function* monitorBackendTask (saga: any): IterableIterator<Effect> {
  const taskRef = {
    task: undefined,
  };
  try {
    yield put(actionCreators.backendTaskStarted(taskRef));
    taskRef.task = yield fork(function* () {
      yield call(saga);
      yield put(actionCreators.backendTaskDone(taskRef));
    });
  } catch (ex) {
    if (!(yield cancelled())) {
      AppToaster.show({message: ex.toString()});
      yield put(actionCreators.backendTaskFailed(taskRef, ex.toString()));
    }
  }
}

export function* loadContests (): IterableIterator<Effect> {
  let contests: Contest[] = yield select((state: State) => state.contests);
  if (!contests) {
    yield call(delay, 500);
    contests = testContests;
    yield put(actionCreators.contestListLoaded(contests));
  }
  return contests;
}

export function* loadContest (contestId: string) : IterableIterator<Effect> {
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
    yield put(actionCreators.contestLoaded(contest));
  }
  return contest;
}

export function* loadTask (taskId: string) : IterableIterator<Effect> {
  let task: Task | undefined = yield select((state: State) => state.task);
  if (!task || task.id !== taskId) {
    yield call(delay, 500);
    task = testTasks.find(task => task.id === taskId);
    if (!task) throw new Error("task failed to load");
    yield put(actionCreators.taskLoaded(task));
  }
  return task;
}

export function* loadTaskResources () : IterableIterator<Effect> {
  let taskResources: TaskResource[] | undefined = yield select((state: State) => state.task_resources);
  if (!taskResources) {
    const taskId: string = yield select((state: State) => {
      if (state.contest) return state.contest.task_id;
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
