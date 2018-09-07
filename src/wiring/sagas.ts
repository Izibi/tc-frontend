
import {Effect} from 'redux-saga';
import {all, call, put, takeEvery} from 'redux-saga/effects';

import {navigate} from '../router';
import {ActionTypes, actionCreators} from '../app';

export default function* () {
  // yield setContext(props);
  try {
    yield all([
      call(function () { console.log('sagas are running'); }),
      call(require('../router').saga),
      call(navigateOnUserLogout),
    ]);
  } catch (ex) {
    yield put(actionCreators.sagaError(ex));
  }
}

function* navigateOnUserLogout () : IterableIterator<Effect> {
  yield takeEvery(ActionTypes.USER_LOGGED_OUT, userLoggedOutSaga);
}

function* userLoggedOutSaga (action: any) : IterableIterator<Effect> {
  yield call(navigate, "UnauthenticatedUserLanding", {}, true);
}
