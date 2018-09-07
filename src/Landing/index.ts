
import {Effect} from 'redux-saga';
import {call, put, select, takeEvery} from 'redux-saga/effects';
import {delay} from 'redux-saga';

import {Actions, actionCreators, ActionTypes, State} from '../app';
import {Rule, navigate} from '../router';
import {loadContests} from '../Backend';

import UnauthenticatedUserPage from './UnauthenticatedUser';
import AuthenticatedUserPage from './AuthenticatedUser';

export {LandingState} from './types';

export const routes : Rule[] = [
  {
    name: "UnauthenticatedUserLanding",
    pattern: "/",
    component: UnauthenticatedUserPage,
    saga: unauthenticatedUserSaga,
  },
  {
    name: "AuthenticatedUserLanding",
    pattern: "/contests",
    component: AuthenticatedUserPage,
    saga: authenticatedUserSaga,
  },
];

export function landingReducer (state: State, action: Actions): State {
  switch (action.type) {
    case ActionTypes.USER_LOGGED_IN: {
      const {user} = action.payload;
      return {...state, user};
    }
    case ActionTypes.CONTEST_LIST_LOADED: {
      const {contests} = action.payload;
      return {...state, authenticated_user_landing_page: {
        ...state.authenticated_user_landing_page,
        loaded: true,
        filter: "current",
        contests,
      }};
    }
  }
  return state;
}

function* unauthenticatedUserSaga () : IterableIterator<Effect> {
  const user = yield select((state : State) => state.user);
  if (user) {
    yield call(redirectToAuthenticatedUserLanding);
  } else {
    yield takeEvery(ActionTypes.USER_LOGGED_IN, userLoggedInSaga);
    console.log('wait for user to log in');
  }
}

function* userLoggedInSaga (action: any) : IterableIterator<Effect> {
  yield call(redirectToAuthenticatedUserLanding);
}

function* redirectToAuthenticatedUserLanding () : IterableIterator<Effect> {
  yield call(navigate, "AuthenticatedUserLanding", {}, true);
}

function* authenticatedUserSaga () : IterableIterator<Effect> {
  // TODO: load contests available to user
  yield call(delay, 500);
  const contests = yield call(loadContests);
  yield put(actionCreators.contestListLoaded(contests));
}
