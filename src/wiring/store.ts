
import {Actions} from '../app';

import {ErrorsState, errorsReducer} from '../errors';
import {RouterState, routerReducer} from '../router';
import {LandingState} from '../Landing';
import {TaskState, taskReducer} from '../Task';

export type State =
  ErrorsState & RouterState & LandingState & TaskState

export const initialState : State = {
  path: '/',
  route: null,
  lastError: null,
  authenticated_user_landing_page: {
    loaded: false,
    contests: [],
    filter: "current",
  },
  task: null,
  task_resources_page: {
    loaded: false,
    currentIndex: 0,
    resources: [],
  },
};

export function reducer (state: State | undefined, action: Actions) : State {
  let newState : State = state === undefined ? initialState : state;
  try {
    newState = errorsReducer(newState, action);
    newState = routerReducer(newState, action);
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
