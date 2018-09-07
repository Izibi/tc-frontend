
import {Effect} from 'redux-saga';
import {call, put, select} from 'redux-saga/effects';

import {State, Actions, ActionTypes, actionCreators} from '../app';
import {Rule} from '../router';
import {monitorBackendTask, loadContest, loadTask, loadTaskResources} from '../Backend';
import {Contest, Task, TaskResource}  from '../types';

import TaskResourcesPage from './TaskResources';
import {TaskResourcesParams} from './types';

export {TaskState} from './types';

export function taskReducer (state: State, action: Actions): State {
  switch (action.type) {
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
  }
  return state;
}

function* taskResourcesSaga (params: TaskResourcesParams) : IterableIterator<Effect> {
  yield call(monitorBackendTask, function* () {
    const contest: Contest = yield call(loadContest, params.contestId);
    const task: Task = yield call(loadTask, contest.task_id);
    let task_resources: TaskResource[] | undefined = yield select((state: State) => state.task_resources);
    if (!task_resources) {
      const taskResources: TaskResource[] = yield call(loadTaskResources, task.id);
      if (!taskResources) throw new Error("task resources failed to load");
      yield put(actionCreators.taskResourcesLoaded(taskResources));
    }
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
