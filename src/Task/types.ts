
import {Task, TaskResource} from '../types';

export type TaskResourcesParams = {
  contestId: string,
  resourceIndex: string,
}

type TaskResourcesState = {
  loaded: boolean,
  resources: TaskResource[],
}

export type TaskState = {
  task: null | Task,
  task_resources_page: null | TaskResourcesState
}
