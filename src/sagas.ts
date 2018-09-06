
import {all, put} from 'redux-saga/effects';

import {actionCreators} from './app';

export default function* () {
  // yield setContext(props);
  try {
    yield all([
      require('./router').saga,
    ]);
  } catch (ex) {
    yield put(actionCreators.sagaError(ex));
  }
}
