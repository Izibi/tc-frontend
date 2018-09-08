
import {Effect} from 'redux-saga';
import {call} from 'redux-saga/effects';

import {State, Actions} from '../app';
import {Rule} from '../router';
import {monitorBackendTask, loadContest, loadTask, loadTaskResources} from '../Backend';
import {Contest}  from '../types';

import TaskResourcesPage from './TaskResources';
import {TaskResourcesParams} from './types';

export {TaskState} from './types';

export function taskReducer (state: State, action: Actions): State {
  return state;
}

function* taskResourcesSaga (params: TaskResourcesParams) : IterableIterator<Effect> {
  yield call(monitorBackendTask, function* () {
    const contest: Contest = yield call(loadContest, params.contestId);
    yield call(loadTask, contest.task_id);
    yield call(loadTaskResources);
  });
}

export const routes : Rule[] = [
  {
    name: "TaskResources",
    pattern: "/contests/:contestId/task/:resourceIndex",
    component: TaskResourcesPage,
    saga: taskResourcesSaga
  },
];
