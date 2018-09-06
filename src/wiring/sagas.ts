
import {all, call, put} from 'redux-saga/effects';

import {actionCreators} from '../app';

export default function* () {
  // yield setContext(props);
  try {
    yield all([
      call(function () { console.log('sagas are running'); }),
      call(require('../router').saga),
    ]);
  } catch (ex) {
    yield put(actionCreators.sagaError(ex));
  }
}
