
import {Effect} from 'redux-saga';
import {call} from 'redux-saga/effects';

import {State, Actions} from '../app';
import {Rule} from '../router';
import {monitorBackendTask, loadContest} from '../Backend';

import TaskResourcesPage from './TaskResources';
import {TaskResourcesParams} from './types';

export function taskReducer (state: State, action: Actions): State {
  return state;
}

function* taskResourcesSaga (params: TaskResourcesParams) : IterableIterator<Effect> {
  yield call(monitorBackendTask, function* () {
    yield call(loadContest, params.contestId);
  });
}

export const routes : Rule<TaskResourcesParams>[] = [
  {
    name: "TaskResources",
    pattern: "/contests/:contestId/task/:resourceIndex",
    reducer: (state: State, params: TaskResourcesParams) => ({
      ...state,
      contestId: params.contestId,
      taskResourceIndex: parseInt(params.resourceIndex),
    }),
    component: TaskResourcesPage,
    saga: taskResourcesSaga
  },
];
