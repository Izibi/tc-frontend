
import {Actions, ActionTypes, State} from '../app';

export function routerReducer (state: State, action: Actions) {
  switch (action.type) {
    case ActionTypes.ROUTE_CHANGED: {
      const {route} = action.payload;
      return {...state, route};
    }
  }
  return state;
}
