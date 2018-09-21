
import {Effect} from 'redux-saga';
import {call, put, select} from 'redux-saga/effects';

import {Actions, ActionTypes, State, actionCreators} from '../app';
import {Rule, navigate} from '../router';
import {monitorBackendTask, getUser, loadAuthenticatedUserLanding} from '../Backend';

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
  const currentUserId: string = yield select((state : State) => state.userId);
  if (currentUserId === 'unknown') {
    const userId : string | undefined = yield call(getUser);
    if (userId !== undefined) {
      /* See wiring/sagas.ts for handling of USER_LOGGED_IN,
         which causes a re-evaluation of the current route. */
      yield put(actionCreators.userLoggedIn(userId));
    }
  } else {
    yield call(navigate, "AuthenticatedUserLanding", {}, true);
  }

}

function* authenticatedUserSaga () : IterableIterator<Effect> {
  yield call(monitorBackendTask, function* () {
    const view: {userId: string, contestIds: string[]} = yield call(loadAuthenticatedUserLanding);
    const currentUserId = yield select((state: State) => state.userId)
    if (view.userId !== currentUserId) {
      yield put(actionCreators.userLoggedIn(view.userId));
    }
    yield put(actionCreators.contestListChanged(view.contestIds));
  });
}
