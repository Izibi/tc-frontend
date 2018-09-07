
import {Route} from '../router';
import {Contest, TaskResource, User} from '../types';

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
  reactError: (error: Error | null, info: {componentStack: any}) => createAction(ActionTypes.REACT_ERROR, {error, info}),
  sagaError: (error: Error) => createAction(ActionTypes.SAGA_ERROR, {error}),
  clearError: () => createAction(ActionTypes.CLEAR_ERROR, {}),

  // login
  userLoggedIn: (user: User) => createAction(ActionTypes.USER_LOGGED_IN, {user}),

  contestListLoaded: (contests: Contest[]) => createAction(ActionTypes.CONTEST_LIST_LOADED, {contests}),
  contestSelected: (contest: Contest) => createAction(ActionTypes.CONTEST_SELECTED, {contest}),

  // Task
  taskResourcesLoaded: (resources: TaskResource[]) => createAction(ActionTypes.TASK_RESOURCES_LOADED, {resources}),

};

type FunctionType = (...args: any[]) => any;
type ActionCreatorMapObject = {[actionCreator: string]: FunctionType};
type ActionsUnion<A extends ActionCreatorMapObject> = ReturnType<A[keyof A]>;
export type Actions = ActionsUnion<typeof actionCreators>;

// export type GetAction<T: string> = {}
