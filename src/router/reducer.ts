
import {Actions, ActionTypes} from '../app';
import {State} from './types';

export function reducer (state: State, action: Actions) {
  switch (action.type) {
    case ActionTypes.ROUTE_CHANGED: {
      const {route} = action.payload;
      return {...state, route};
    }
  }
  return state;
}
