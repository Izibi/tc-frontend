
import {Effect} from 'redux-saga';
import {call, put, select} from 'redux-saga/effects';

import {State, Actions, ActionTypes, actionCreators} from '../app';
import {Rule} from '../router';

import TaskResourcesPage from './TaskResources';

export {TaskState} from './types';

export function taskReducer (state: State, action: Actions): State {
  switch (action.type) {
    case ActionTypes.TASK_RESOURCES_LOADED: {
      const {resources} = action.payload;
      return ({...state, task_resources_page: {
        ...state.task_resources_page,
        loaded: true,
        resources
      }});
    }
  }
  return state;
}

function* taskResourcesSaga () : IterableIterator<Effect> {
  if (yield select((state: State) => state.task_resources_page.loaded)) {
    return;
  }
  console.log('load task resources');
  yield call(function () {
    console.log("Yay!");
  });
  yield put(actionCreators.taskResourcesLoaded([]));
}

export const routes : Rule[] = [
  {
    name: "TaskResources",
    pattern: "/contests/:contestId/task/:resourceIndex",
    component: TaskResourcesPage,
    saga: taskResourcesSaga
  },
];
