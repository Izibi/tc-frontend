
import {Route} from '../router';
import {TaskResource, User} from '../types';

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

  // Task
  taskResourcesLoaded: (resources: TaskResource[]) => createAction(ActionTypes.TASK_RESOURCES_LOADED, {resources}),
  taskResourceSelected: (index: number) => createAction(ActionTypes.TASK_RESOURCE_SELECTED, {index}),

};

type FunctionType = (...args: any[]) => any;
type ActionCreatorMapObject = {[actionCreator: string]: FunctionType};
type ActionsUnion<A extends ActionCreatorMapObject> = ReturnType<A[keyof A]>;
export type Actions = ActionsUnion<typeof actionCreators>;
