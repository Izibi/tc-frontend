
import {Effect} from 'redux-saga';
import {fork, call, put, select, cancelled} from 'redux-saga/effects';
import {delay} from 'redux-saga';
import * as moment from 'moment';

import {without} from '../utils';
import {actionCreators, Actions, ActionTypes, State} from '../app';
import {Contest, Task} from '../types';

export {BackendState} from './types';

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
      yield put(actionCreators.backendTaskFailed(taskRef, ex.toString()));
    }
  }
}

export function* loadContests (): IterableIterator<Effect> {
  // TODO
  yield call(delay, 500);
  return testContests;
}

export function* loadContest (contestId: string) : IterableIterator<Effect> {
  let contest: Contest | undefined = yield select((state: State) => state.contest);
  if (!contest || contest.id !== contestId) {
    yield call(delay, 500);
    contest = testContests.find(contest => contest.id === contestId);
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

export function* loadTaskResources (taskId: string) : IterableIterator<Effect> {
  // TODO
  yield call(delay, 500);
  return [
    {title: "Task description", description: "This section describes the task", url: "about:blank#0"},
    {title: "Commands", description: "", url: "about:blank#1"},
    {title: "API", description: "", url: "about:blank#2"},
    {title: "Examples", description: "", url: "about:blank#3"},
    {title: "OCaml basics", description: "", url: "about:blank#4"},
  ];
}
