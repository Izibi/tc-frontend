
import {Effect} from 'redux-saga';
import {all, call, put, takeEvery} from 'redux-saga/effects';

import {navigate, reload} from '../router';
import {ActionTypes, actionCreators} from '../app';

export default function* () {
  // yield setContext(props);
  try {
    yield all([
      call(function () { console.log('sagas are running'); }),
      call(require('../router').saga),
      call(reloadOnUserLogin),
      call(navigateOnUserLogout),
    ]);
  } catch (ex) {
    yield put(actionCreators.sagaError(ex));
  }
}


function* reloadOnUserLogin () : IterableIterator<Effect> {
  yield takeEvery(ActionTypes.USER_LOGGED_IN, function* (action: any) {
    console.log('user logged in, reload page');
    yield call(reload);
  });
}

function* navigateOnUserLogout () : IterableIterator<Effect> {
  yield takeEvery(ActionTypes.USER_LOGGED_OUT, function* (action: any) {
    yield call(navigate, "UnauthenticatedUserLanding", {}, true);
  });
}


