
import {Task} from '../types';

export type TaskResource = {
  title: string,
  description: string,
  url: string,
}

export type TaskResourcesState = {
  loaded: boolean,
  currentIndex: number,
  resources: TaskResource[],
}

export type State = {
  task: null | Task,
  task_resources_page: TaskResourcesState
}
