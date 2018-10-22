
import {Route} from '../router';
import {Block} from '../types';
import {EntitiesUpdate, EntityChange} from '../Backend';
import {Game} from '../Backend/types';

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

  // backend
  backendTaskStarted: (task: object) => createAction(ActionTypes.BACKEND_TASK_STARTED, {task}),
  backendTaskFailed: (task: object, error: string) => createAction(ActionTypes.BACKEND_TASK_FAILED, {task, error}),
  backendTaskDone: (task: object) => createAction(ActionTypes.BACKEND_TASK_DONE, {task}),
  backendEntitiesLoaded: (entities: EntitiesUpdate) => createAction(ActionTypes.BACKEND_ENTITIES_LOADED, {entities}),
  pushLocalChanges: (items: EntityChange[]) => createAction(ActionTypes.PUSH_LOCAL_CHANGES, {items}),

  // eventsource
  eventSourceKeyChanged: (key: string) => createAction(ActionTypes.EVENTSOURCE_KEY_CHANGED, {key}),
  eventSourceSubsChanged: (channels: string[]) => createAction(ActionTypes.EVENTSOURCE_SUBS_CHANGED, {channels}),

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

  // chain list
  chainListScrolled: (first: number, last: number) => createAction(ActionTypes.CHAIN_LIST_SCROLLED, {first, last}),
  gameLoaded: (gameKey: string, game: Game, blocks: Block[] | null) => createAction(ActionTypes.GAME_LOADED, {gameKey, game, blocks}),

  // chain actions
  forkChain: (chainId: string) => createAction(ActionTypes.FORK_CHAIN, {chainId}),
  deleteChain: (chainId: string) => createAction(ActionTypes.DELETE_CHAIN, {chainId}),

  // chain events
  chainCreated: (chainId: string) => createAction(ActionTypes.CHAIN_CREATED, {chainId}),
  chainDeleted: (chainId: string) => createAction(ActionTypes.CHAIN_DELETED, {chainId}),

  // blocks
  blockLoaded: (hash: string, block: Block) => createAction(ActionTypes.BLOCK_LOADED, {hash, block}),

};

type FunctionType = (...args: any[]) => any;
type ActionCreatorMapObject = {[actionCreator: string]: FunctionType};
type ActionsUnion<A extends ActionCreatorMapObject> = ReturnType<A[keyof A]>;
export type Actions = ActionsUnion<typeof actionCreators>;
export type ActionsOfType<T extends string> = Extract<Actions, {type: T}>;
