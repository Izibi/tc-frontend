
import {Task, TaskResource} from '../types';

type TaskResourcesState = {
  loaded: boolean,
  currentIndex: number,
  resources: TaskResource[],
}

export type TaskState = {
  task: null | Task,
  task_resources_page: TaskResourcesState
}
