
import {Actions, State} from '../app';
import * as ActionTypes from './action_types';

export function routerReducer (state: State, action: Actions) {
  switch (action.type) {
    case ActionTypes.ROUTE_CHANGED: {
      const {route} = action.payload;
      return {...state, route};
    }
  }
  return state;
}
