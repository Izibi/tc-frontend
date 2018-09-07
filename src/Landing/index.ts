
import * as moment from 'moment';
import {Effect} from 'redux-saga';
import {call, put, select, takeEvery} from 'redux-saga/effects';
import {delay} from 'redux-saga';

import {Actions, actionCreators, ActionTypes, State} from '../app';
import {Rule, navigate} from '../router';
import {Contest} from '../types';

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
        contests,
      }};
    }
    case ActionTypes.CONTEST_SELECTED: {
      const {contest} = action.payload;
      return {...state, contest};
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
  const contests : Contest[] = [
    {
      id: "1",
      title: "Contest name",
      description: "Lorem ipsum blah blah",
      logo_url: null,
      registration_open: true,
      registration_closes_at: moment('2018-09-05'),
      starts_at: moment('2018-09-05'),
      ends_at: moment('2018-09-10'),
      task: {
        id: "1",
        title: "task 1",
      },
    }
  ];
  yield put(actionCreators.contestListLoaded(contests));
  yield takeEvery(ActionTypes.CONTEST_SELECTED, contestSelectedSaga);
}

function* contestSelectedSaga (action: any) : IterableIterator<Effect> {
  const contestId = action.payload.contest.id;
  const resourceIndex = 0;
  yield call(navigate, "TaskResources", {contestId, resourceIndex}, true);
}
