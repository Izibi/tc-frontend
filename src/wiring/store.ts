
import {Actions} from '../app';

import {ErrorsState, errorsReducer} from '../errors';
import {RouterState, routerReducer} from '../router';
import {BackendState, backendReducer} from '../Backend';
import {ContestState, contestReducer} from '../Contest';
import {LandingState, landingReducer} from '../Landing';
import {TeamState, teamReducer} from '../Team';
import {TaskState, taskReducer} from '../Task';

export type State =
  ErrorsState &
  RouterState &
  BackendState &
  LandingState &
  TeamState &
  TaskState &
  ContestState

export const initialState : State = {
  path: '/',
  route: undefined,
  lastError: undefined,
  contests: undefined,
  contest: undefined,
  contestPeriod: undefined,
  mainChain: undefined,
  task: undefined,
  task_resources: undefined,
  team: 'unknown',
  user: undefined,
  backend: {
    tasks: [],
    lastError: undefined,
  },
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
