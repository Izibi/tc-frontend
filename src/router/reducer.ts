
import {Actions, ActionTypes, State} from '../app';

export function routerReducer (state: State, action: Actions) {
  switch (action.type) {
    case ActionTypes.ROUTE_CHANGED: {
      const {route} = action.payload;
      return route.rule.reducer({...state, route}, route.params);
    }
  }
  return state;
}
