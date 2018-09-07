
import {Effect} from 'redux-saga';
import {call, put, select} from 'redux-saga/effects';

import {State, Actions, ActionTypes, actionCreators} from '../app';
import {Rule} from '../router';
import {loadContest} from '../Contest';
import {Contest}  from '../types';

import TaskResourcesPage from './TaskResources';
import {TaskResourcesParams} from './types';

export {TaskState} from './types';

export function taskReducer (state: State, action: Actions): State {
  switch (action.type) {
    case ActionTypes.TASK_RESOURCES_LOADED: {
      const {resources} = action.payload;
      return {...state, task_resources_page: {
        ...state.task_resources_page,
        loaded: true,
        resources
      }};
    }
  }
  return state;
}

function contestChanged (state: State, contestId: string) {
  return !state.contest || state.contest.id !== contestId;
}

function* taskResourcesSaga (params: TaskResourcesParams) : IterableIterator<Effect> {

  /* Ensure the right contest is loaded. */
  if (yield select(contestChanged, params.contestId)) {
    const contest : Contest = yield call(loadContest, params.contestId);
    yield put(actionCreators.contestSelected(contest));
  }

  if (!(yield select((state: State) => state.task_resources_page && state.task_resources_page.loaded))) {
    console.log('TODO: load task resources');
    yield put(actionCreators.taskResourcesLoaded([
      {title: "Task description", description: "This section describes the task", url: "about:blank#0"},
      {title: "Commands", description: "", url: "about:blank#1"},
      {title: "API", description: "", url: "about:blank#2"},
      {title: "Examples", description: "", url: "about:blank#3"},
      {title: "OCaml basics", description: "", url: "about:blank#4"},
    ]));
  }
}

export const routes : Rule[] = [
  {
    name: "TaskResources",
    pattern: "/contests/:contestId/task/:resourceIndex",
    component: TaskResourcesPage,
    saga: taskResourcesSaga
  },
];
