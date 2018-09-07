
import {Actions} from '../app';

import {ErrorsState, errorsReducer} from '../errors';
import {RouterState, routerReducer} from '../router';
import {ContestState, contestReducer} from '../Contest';
import {LandingState, landingReducer} from '../Landing';
import {TaskState, taskReducer} from '../Task';

export type State =
  ErrorsState & RouterState & LandingState & TaskState & ContestState

export const initialState : State = {
  path: '/',
  route: null,
  lastError: null,
  contest: null,
  contestPeriod: null,
  mainChain: null,
  task: null,
  user: null,
  authenticated_user_landing_page: {
    loaded: false,
    contests: [],
    filter: "current",
  },
  task_resources_page: null,
};

export function reducer (state: State | undefined, action: Actions) : State {
  let newState : State = state === undefined ? initialState : state;
  try {
    newState = errorsReducer(newState, action);
    newState = routerReducer(newState, action);
    newState = contestReducer(newState, action);
    newState = landingReducer(newState, action);
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
