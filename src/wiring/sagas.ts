
import {Effect, eventChannel, buffers, END} from 'redux-saga';
import {all, call, put, take, takeEvery} from 'redux-saga/effects';

import {navigate, reload} from '../router';
import {ActionTypes, actionCreators} from '../app';

export default function* () {
  // yield setContext(props);
  try {
    yield all([
      call(require('../router').saga),
      call(require('../Backend').saga),
      call(reloadOnUserLogin),
      call(navigateOnUserLogout),
      call(messageListenerSaga),
    ]);
  } catch (ex) {
    yield put(actionCreators.sagaError(ex));
  }
}


function* reloadOnUserLogin () : IterableIterator<Effect> {
  yield takeEvery(ActionTypes.USER_LOGGED_IN, function* (action: any) {
    yield call(reload);
  });
}

function* navigateOnUserLogout () : IterableIterator<Effect> {
  yield takeEvery(ActionTypes.USER_LOGGED_OUT, function* (action: any) {
    yield call(navigate, "UnauthenticatedUserLanding", {}, true);
  });
}

function* messageListenerSaga () {
  type M = {
    type: "login",
    userId: string,
    csrfToken: string,
  } | {
    type: "logout",
    csrfToken: string,
  }
  type T = {source: MessageEventSource, message: M};
  const messageChannel = eventChannel<T>(function (listener) {
    const onMessage = function (event: MessageEvent) {
      let {data} = event;
      if (typeof data !== 'string') {
        data = JSON.stringify(data);
      }
      if (!data.startsWith('{')) {
        return;
      }
      const message = JSON.parse(data);
      if (typeof message === 'object') {
        listener(message);
      }
    };
    window.addEventListener('message', onMessage);
    return function () {
      window.removeEventListener('message', onMessage);
    };
  }, buffers.expanding(1));
  while (true) {
    let message : M | END = yield take(messageChannel);
    if (message === END) {
      return;
    }
    if (message.type === "login") {
      const {userId} = message;
      yield put(actionCreators.userLoggedIn(userId));
    } else if (message.type === "logout") {
      /* Reload the page on logout, the session has been cleared and the CSRF
         token is no longer valid.  Alternatively we could reload the CSRF
         script from the backend, or receive a new CSRF token in the logout
         message. */
      // yield put(actionCreators.userLoggedOut());
      location.reload();
    }
  }
}
