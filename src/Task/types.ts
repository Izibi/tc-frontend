
import {Task, TaskResource} from '../types';

export type TaskResourcesParams = {
  contestId: string,
  resourceIndex: string,
}

export type TaskState = {
  task: Task | undefined,
  task_resources: TaskResource[] | undefined,
}
