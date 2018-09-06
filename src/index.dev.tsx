
import * as React from 'react';
import {render} from 'react-dom';
import {createStore, applyMiddleware, compose, Store, StoreEnhancer} from 'redux';
import {Provider} from 'react-redux';
import {default as createSagaMiddleware} from 'redux-saga';
import {createLogger} from 'redux-logger';
import {AppContainer} from 'react-hot-loader';

import './global.scss';
import {State} from './types';
import {actionCreators} from './actions';
import {reducer, initialState} from './store';
import App from './App';
import {startRouter} from './router';
import routes from './routes';

const hot = (module as any).hot;
const app : any = (window as any).app = {};

function start () {

  // Redux Configuration
  const middleware = [];
  const enhancers = [];

  // Saga Middleware
  const sagaMiddleware = createSagaMiddleware();
  middleware.push(sagaMiddleware);

  // Logging Middleware
  const logger = createLogger({
    level: 'info',
    collapsed: true
  });

  // Skip redux logs in console during the tests
  if (process.env.NODE_ENV !== 'test') {
    middleware.push(logger);
  }

  // Redux DevTools Configuration
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  let composeEnhancers : ((...enhancers: StoreEnhancer[]) => StoreEnhancer) = compose;
  if ('__REDUX_DEVTOOLS_EXTENSION_COMPOSE__' in window as any) {
    composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Options: https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md#windowdevtoolsextensionconfig
      actionCreators
    });
  }
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers);

  // Create Store
  const store = createStore(reducer, initialState, enhancer);
  const rootTask = sagaMiddleware.run(module.require('./sagas')['default']);

  if (hot) {
    hot.accept('./src/actions.ts', function () {
      console.log("HOT actions");
      app.actionCreators = module.require('./actions')['actionCreators'];
    });
    hot.accept('./src/store.ts', function () {
      console.log("HOT store");
      const reducer = module.require('./store')['reducer'];
      store.replaceReducer(reducer);
      store.dispatch(actionCreators.clearError());
    });
    hot.accept('./src/routes.ts', function () {
      console.log("HOT routes");
      const routes = module.require('./routes')['default'];
      const {startRouter} = module.require('./router');
      startRouter(store.dispatch, routes);
    });
    hot.accept('./src/sagas.js', function () {
      console.log("HOT sagas");
      const rootSaga = module.require('./sagas')['default'];
      app.rootTask.cancel();
      store.dispatch(actionCreators.clearError());
      app.rootTask = sagaMiddleware.run(rootSaga);
      /* XXX Restart the current route's saga. */
    });
    hot.accept('./src/App.tsx', function () {
      console.log("HOT views");
      const App = module.require('./App')['default'];
      renderApp(App, store);
    });
  }

  store.dispatch(actionCreators.init());
  startRouter(store.dispatch, routes);

  Object.assign(app, {actionCreators, store, rootTask});
  renderApp(App, store);
}

function renderApp (App : React.ComponentClass, store : Store<State>) {
  render(
    <AppContainer>
      <Provider store={store}>
        <App />
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  );
}

start();
