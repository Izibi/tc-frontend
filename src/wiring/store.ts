
import {Actions, ActionTypes} from '../app';
import {ErrorsState, errorsReducer} from '../errors';
import {RouterState, routerReducer} from '../router';
import {BackendState, backendReducer, backendInit} from '../Backend';
import {contestReducer} from '../Contest';
import {landingReducer} from '../Landing';
import {teamReducer} from '../Team';
import {taskReducer} from '../Task';
import {chainsReducer} from '../Chains';
import {ChainFilters} from '../types';

export type State =
  ErrorsState &
  RouterState &
  BackendState &
  {
    userId: string /* id of user logged in or 'unknonw' */,
    contestIds: string[] | undefined /* list of available contests, if loaded */,
    contestId: string /* id of current contest or 'unknown' */,
    teamId: string | null /* id of user's team or null or 'unknown' */,
    chainId: string /* id of selected chain or 'unknown' */,
    blockHash: string /* hash of selected block or 'unknown' or 'last' */,
    taskResourceIndex: number /* index of resource selected in task tab */,
    chainIds: string[] /* list of chains to display */,
    chainList: {
      firstVisible: number,
      lastVisible: number,
      visibleIds: string[],
    },
    chainFilters: ChainFilters,
  }

export const initialState : State = {

  path: '/',
  route: undefined,
  lastError: undefined,
  ...backendInit,

  userId: 'unknown',
  contestIds: undefined,
  contestId: 'unknown',
  teamId: 'unknown',
  chainId: 'unknown',
  blockHash: 'unknown',
  taskResourceIndex: 0,
  chainIds: [],
  chainList: {
    firstVisible: 0,
    lastVisible: -1,
    visibleIds: [],
  },
  chainFilters: {
    status: "main",
  },

};

function coreReducer(state: State, action: Actions): State {
  if (action.type === ActionTypes.LOAD) {
    return action.payload.state;
  }
  return state;
}

export function reducer (state: State | undefined, action: Actions) : State {
  let newState : State = state === undefined ? initialState : state;
  try {
    newState = coreReducer(newState, action);
    newState = errorsReducer(newState, action);
    newState = routerReducer(newState, action);
    newState = backendReducer(newState, action);
    newState = contestReducer(newState, action);
    newState = landingReducer(newState, action);
    newState = teamReducer(newState, action);
    newState = taskReducer(newState, action);
    newState = chainsReducer(newState, action);
    return newState;
  } catch (ex) {
    return {...newState,
      lastError: {
        source: "reducer",
        error: ex,
      }
    };
  }
};
