
import {Route} from '../router';
import {Contest, ContestPeriod, Task, TaskResource, Team, User} from '../types';

import * as ActionTypes from './action_types';

export interface Action<T extends string, P> {
  type: T,
  payload: P,
}

export function createAction<T extends string, P>(type: T, payload: P) : Action<T, P> {
  return {type, payload};
}

export const actionCreators = {

  init: () => createAction(ActionTypes.INIT, {}),

  // router
  routeChanged: (route: Route) => createAction(ActionTypes.ROUTE_CHANGED, {route}),

  // errors
  reactError: (error: Error | undefined, info: {componentStack: any}) => createAction(ActionTypes.REACT_ERROR, {error, info}),
  sagaError: (error: Error) => createAction(ActionTypes.SAGA_ERROR, {error}),
  clearError: () => createAction(ActionTypes.CLEAR_ERROR, {}),

  // backend
  backendTasksCleared: () => createAction(ActionTypes.BACKEND_TASKS_CLEARED, {}),
  backendTaskStarted: (task: object) => createAction(ActionTypes.BACKEND_TASK_STARTED, {task}),
  backendTaskFailed: (task: object, error: string) => createAction(ActionTypes.BACKEND_TASK_FAILED, {task, error}),
  backendTaskDone: (task: object) => createAction(ActionTypes.BACKEND_TASK_DONE, {task}),

  // login
  userLoggedOut: () => createAction(ActionTypes.USER_LOGGED_OUT, {}),
  userLoggedIn: (user: User) => createAction(ActionTypes.USER_LOGGED_IN, {user}),

  contestListLoaded: (contests: Contest[]) => createAction(ActionTypes.CONTEST_LIST_LOADED, {contests}),
  contestLoaded: (contest: Contest, contestPeriod: ContestPeriod | undefined) => createAction(ActionTypes.CONTEST_LOADED, {contest, contestPeriod}),
  taskLoaded: (task: Task) => createAction(ActionTypes.TASK_LOADED, {task}),
  taskResourcesLoaded: (resources: TaskResource[]) => createAction(ActionTypes.TASK_RESOURCES_LOADED, {resources}),
  teamLoaded: (team: Team) => createAction(ActionTypes.TEAM_LOADED, {team}),

  changeTeamAccessCode: () => createAction(ActionTypes.CHANGE_TEAM_ACCESS_CODE, {}),
  leaveTeam: () => createAction(ActionTypes.LEAVE_TEAM, {}),
  changeTeamOpen: (isOpen: boolean) => createAction(ActionTypes.CHANGE_TEAM_OPEN, {isOpen}),

};

type FunctionType = (...args: any[]) => any;
type ActionCreatorMapObject = {[actionCreator: string]: FunctionType};
type ActionsUnion<A extends ActionCreatorMapObject> = ReturnType<A[keyof A]>;
export type Actions = ActionsUnion<typeof actionCreators>;

// export type GetAction<T: string> = {}
