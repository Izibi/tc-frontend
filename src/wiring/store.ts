
import {Actions} from '../app';

import {ErrorsState, errorsReducer} from '../errors';
import {RouterState, routerReducer} from '../router';
import {BackendState, backendReducer} from '../Backend';
import {contestReducer} from '../Contest';
import {landingReducer} from '../Landing';
import {teamReducer} from '../Team';
import {taskReducer} from '../Task';
import {chainsReducer} from '../Chains';

export type State =
  ErrorsState &
  RouterState &
  BackendState &
  {
    userId: string /* id of user logged in or 'unknonw' */,
    contestIds: string[] | undefined /* list of available contests, if loaded */,
    contestId: string /* id of current contest or 'unknown' */,
    teamId: string /* id of user's team or 'unknown' */,
    taskResourceIndex: number /* index of resource selected in task tab */,
    chainIds: string[] /* list of chains to display */,
  }

export const initialState : State = {

  path: '/',
  route: undefined,
  lastError: undefined,
  backend: {
    lastError: undefined,
    tasks: [],
  },

  entities: {
    users: {},
    contests: {},
    tasks: {},
    taskResources: {},
    contestPeriods: {},
    teams: {},
    teamMembers: {},
    chains: {},
  },

  userId: 'unknown',
  contestIds: undefined,
  contestId: 'unknown',
  teamId: 'unknown',
  taskResourceIndex: 0,
  chainIds: [],

};

export function reducer (state: State | undefined, action: Actions) : State {
  let newState : State = state === undefined ? initialState : state;
  try {
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
