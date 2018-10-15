
import {Route} from '../router';
import {EntitiesUpdate} from '../Backend';

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
  routeChanged: (route: Route<object>) => createAction(ActionTypes.ROUTE_CHANGED, {route}),

  // errors
  reactError: (error: Error | undefined, info: {componentStack: any}) => createAction(ActionTypes.REACT_ERROR, {error, info}),
  sagaError: (error: Error) => createAction(ActionTypes.SAGA_ERROR, {error}),
  clearError: () => createAction(ActionTypes.CLEAR_ERROR, {}),

  // model
  eagerlyUpdateEntity: (collection: string, id: string, changes: object) => createAction(ActionTypes.EAGERLY_UPDATE_ENTITY, {collection, id, changes}),

  // backend
  backendTasksCleared: () => createAction(ActionTypes.BACKEND_TASKS_CLEARED, {}),
  backendTaskStarted: (task: object) => createAction(ActionTypes.BACKEND_TASK_STARTED, {task}),
  backendTaskFailed: (task: object, error: string) => createAction(ActionTypes.BACKEND_TASK_FAILED, {task, error}),
  backendTaskDone: (task: object) => createAction(ActionTypes.BACKEND_TASK_DONE, {task}),
  backendEntitiesLoaded: (entities: EntitiesUpdate) => createAction(ActionTypes.BACKEND_ENTITIES_LOADED, {entities}),

  // login
  userLoggedOut: () => createAction(ActionTypes.USER_LOGGED_OUT, {}),
  userLoggedIn: (userId: string) => createAction(ActionTypes.USER_LOGGED_IN, {userId}),

  contestListChanged: (contestIds: string[]) => createAction(ActionTypes.CONTEST_LIST_CHANGED, {contestIds}),
  contestChanged: (contestId: string) => createAction(ActionTypes.CONTEST_CHANGED, {contestId}),
  teamChanged: (teamId: string) => createAction(ActionTypes.TEAM_CHANGED, {teamId}),
  chainListChanged: (chainIds: string[]) => createAction(ActionTypes.CHAIN_LIST_CHANGED, {chainIds}),

  // team management
  createTeam: (contestId: string, teamName: string) => createAction(ActionTypes.CREATE_TEAM, {contestId, teamName}),
  joinTeam: (contestId: string, accessCode: string) => createAction(ActionTypes.JOIN_TEAM, {contestId, accessCode}),
  leaveTeam: (teamId: string) => createAction(ActionTypes.LEAVE_TEAM, {teamId}),
  changeTeamAccessCode: (teamId: string) => createAction(ActionTypes.CHANGE_TEAM_ACCESS_CODE, {teamId}),
  changeTeamIsOpen: (teamId: string, isOpen: boolean) => createAction(ActionTypes.CHANGE_TEAM_IS_OPEN, {teamId, isOpen}),
  changeTeamKey: (teamId: string, publicKey: string) => createAction(ActionTypes.CHANGE_TEAM_KEY, {teamId, publicKey}),

  // protocol edition
  interfaceTextChanged: (text: string) => createAction(ActionTypes.INTERFACE_TEXT_CHANGED, {text}),
  implementationTextChanged: (text: string) => createAction(ActionTypes.IMPLEMENTATION_TEXT_CHANGED, {text}),

};

type FunctionType = (...args: any[]) => any;
type ActionCreatorMapObject = {[actionCreator: string]: FunctionType};
type ActionsUnion<A extends ActionCreatorMapObject> = ReturnType<A[keyof A]>;
export type Actions = ActionsUnion<typeof actionCreators>;

// export type GetAction<T: string> = {}
