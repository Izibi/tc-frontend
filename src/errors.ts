
import {Actions, ActionTypes} from './app';
import {createAction} from './utils';

export type State = {
  lastError: null | {
    source: string,
    error: Error | null,
    info?: {componentStack: any}
  }
}

export const actionCreators = {
  reactError: (error: Error | null, info: {componentStack: any}) => createAction(ActionTypes.REACT_ERROR, {error, info}),
  sagaError: (error: Error) => createAction(ActionTypes.SAGA_ERROR, {error}),
  clearError: () => createAction(ActionTypes.CLEAR_ERROR, {}),
}

export function reducer (state: State, action: Actions): State {
  switch (action.type) {
    case ActionTypes.REACT_ERROR: {
      const {error, info} = action.payload;
      if (process.env.NODE_ENV === "development") {
        if (error) {
          /* Also log to console to allow developer to click in the trace. */
          console.error(error);
        }
      }
      return ({...state, lastError: {
        source: "react",
        error,
        info
      }});
    }
    case ActionTypes.SAGA_ERROR: {
      const {error} = action.payload;
      if (process.env.NODE_ENV === "development") {
        if (error) {
          /* Also log to console to allow developer to click in the trace. */
          console.error(error);
        }
      }
      return ({...state, lastError: {
        source: "saga",
        error
      }});
    }
    case ActionTypes.CLEAR_ERROR: {
      return {...state, lastError: null};
    }
  }
  return state;
}
