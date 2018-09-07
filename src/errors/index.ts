
import {Actions, State, ActionTypes} from '../app';

export {ErrorsState, AppError} from './types';

export function errorsReducer (state: State, action: Actions): State {
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

export {default as ErrorReport} from './Report';
