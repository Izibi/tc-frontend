
import {Effect} from 'redux-saga';
import {call, select, takeEvery} from 'redux-saga/effects';

import {Actions, ActionTypes, State} from '../app';
import {Rule, navigate} from '../router';
import {monitorBackendTask, loadContests} from '../Backend';

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
    case ActionTypes.USER_LOGGED_OUT: {
      return {...state,
        user: undefined,
        contest: undefined, task: undefined, task_resources: undefined
      };
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
  }
}

function* userLoggedInSaga (action: any) : IterableIterator<Effect> {
  yield call(redirectToAuthenticatedUserLanding);
}

function* redirectToAuthenticatedUserLanding () : IterableIterator<Effect> {
  yield call(navigate, "AuthenticatedUserLanding", {}, true);
}

function* authenticatedUserSaga () : IterableIterator<Effect> {
  yield call(monitorBackendTask, function* () {
    yield call(loadContests);
  });
}
