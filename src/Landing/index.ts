
import {Effect} from 'redux-saga';
import {call, put, select} from 'redux-saga/effects';

import {Actions, ActionTypes, State, actionCreators} from '../app';
import {Rule, navigate} from '../router';
import {monitorBackendTask, loadContestList} from '../Backend';

import UnauthenticatedUserPage from './UnauthenticatedUser';
import AuthenticatedUserPage from './AuthenticatedUser';

export {LandingState} from './types';

export const routes : Rule<object>[] = [
  {
    name: "UnauthenticatedUserLanding",
    test: (state: State, pathname: string) => state.userId === 'unknown' || pathname === '/' ? {} : null,
    reducer: (state: State, params: object) => state,
    pathname: "/",
    component: UnauthenticatedUserPage,
    saga: unauthenticatedUserSaga,
  },
  {
    name: "AuthenticatedUserLanding",
    pattern: "/contests",
    reducer: (state: State, params: object) => state,
    component: AuthenticatedUserPage,
    saga: authenticatedUserSaga,
  },
];

export function landingReducer (state: State, action: Actions): State {
  switch (action.type) {
    case ActionTypes.USER_LOGGED_IN: {
      const {userId} = action.payload;
      return {...state, userId};
    }
    case ActionTypes.USER_LOGGED_OUT: {
      return {...state,
        userId: 'unknown',
        contestId: 'unknown',
      };
    }
  }
  return state;
}

function* unauthenticatedUserSaga () : IterableIterator<Effect> {
  const userId = yield select((state : State) => state.userId);
  if (userId !== 'unknown') {
    yield call(navigate, "AuthenticatedUserLanding", {}, true);
  }
  // See wiring/sagas.ts for handling of USER_LOGGED_IN
}

function* authenticatedUserSaga () : IterableIterator<Effect> {
  yield call(monitorBackendTask, function* () {
    const contestIds = yield call(loadContestList);
    yield put(actionCreators.contestListChanged(contestIds));
  });
}
