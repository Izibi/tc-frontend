
import * as React from 'react';
import {render} from 'react-dom';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import {default as createSagaMiddleware} from 'redux-saga';

import './global.scss';
import {reducer, initialState} from './store';
import {actionCreators} from './actions';
import App from './views/App';
import {startRouter} from './router';
import routes from './routes';

!function () {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(reducer, initialState, applyMiddleware(sagaMiddleware));
  const rootTask = sagaMiddleware.run(module.require('./sagas')['default']);
  store.dispatch(actionCreators.init());
  startRouter(store.dispatch, routes);
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
  );
}();
