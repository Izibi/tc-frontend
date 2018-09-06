
import {Actions, State} from './app';

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
    newState = require("./router").reducer(newState, action);
    newState = require("./errors").reducer(newState, action);
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
