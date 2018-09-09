
import {Store, AnyAction} from 'redux';
import PathParser from 'path-parser'
import {all, call, cancelled, takeLatest} from 'redux-saga/effects';

import {ActionTypes, actionCreators, State} from '../app';
import {Rule, StatefulRule, Route} from './types';

type Matcher = {
  rule: Rule,
  match: (state: State, pathname: string) => object | null,
  build: (params: object) => string,
}

/* private state */
const prefix : string = process.env.MOUNT_PATH || "";
let matchers : Matcher[] = [];
let store : Store<State, AnyAction>;

export function addPrefix (pathname: string) {
  return `${prefix}${pathname}`;
}

function getMatcherByName (ruleName: string) : Matcher | null {
  for (const matcher of matchers) {
    const {rule} = matcher;
    if ('name' in rule && rule.name === ruleName) {
      return matcher;
    }
  }
  return null;
}

function buildRoute (matcher: Matcher, params: object): Route {
  let pathname = matcher.build(params);
  return {rule: matcher.rule, pathname: addPrefix(pathname), params};
}

export function linkTo (ruleName: string, params: object = {}): string {
  const matcher = getMatcherByName(ruleName);
  return matcher
    ? addPrefix(matcher.build(params))
    : `no_rule_for:${ruleName}`;
}

export function navigate (ruleName: string, params: object = {}, replace: boolean = false) {
  const matcher = getMatcherByName(ruleName);
  if (!matcher) {
    // TODO: dispatch router error
    throw new Error(`router has no rule named ${ruleName}`);
  }
  const route = buildRoute(matcher, params);
  if (replace) {
    window.history.replaceState(null, "", route.pathname);
  } else {
    window.history.pushState(null, "", route.pathname);
  }
  store.dispatch(actionCreators.routeChanged(route));
}

export function reload () {
  console.log('core / reload');
  handleCurrentRoute();
}

function dropPrefix (pathname: string): Promise<string> {
  return new Promise(function (resolve, reject) {
    if (pathname.startsWith(prefix)) {
      resolve(pathname.substring(prefix.length));
    } else {
      reject();
    }
  });
}

function getRouteOfPath (pathname: string): Route | null {
  const state = store.getState();
  for (const matcher of matchers) {
    const params = matcher.match(state, pathname);
    if (params) {
      return buildRoute(matcher, params);
    }
  }
  return null;
}

function handleCurrentRoute () {
  dropPrefix(window.location.pathname).then(function (pathname) {
    console.log('pathname', pathname);
    const route = getRouteOfPath(pathname);
    console.log('route', route);
    if (route) {
      store.dispatch(actionCreators.routeChanged(route));
    }
  }).catch(function () {
    console.log("navigate to external path", window.location.pathname);
  });
}

export function startRouter (newStore: Store<State, AnyAction>, rules: Rule[]) {
  console.log('routing for prefix', prefix);
  store = newStore;
  matchers = rules.map(rule => {
    if ('test' in rule) {
      function build (params: object) {
        return (rule as StatefulRule).pathname;
      }
      return {rule, match: rule.test, build};
    } else {
      const parser = new PathParser(rule.pattern);
      function match (_: State, pathname: string): object | null {
        return parser.test(pathname);
      }
      function build (params: object) {
        return parser.build(params);
      }
      return {rule, match, build};
    }
  });
  window.addEventListener('popstate', handleCurrentRoute);
  handleCurrentRoute();
}


export function* saga () {
  console.log('router saga');
  yield all([
    takeLatest(ActionTypes.ROUTE_CHANGED, routeChangedSaga),
  ]);
};

export function* routeChangedSaga (action: any) {
  console.log('took', action);
  const {route} = action.payload;
  if (route.rule.saga) {
    try {
      yield call(route.rule.saga, route.params);
    } catch (ex) {
      if (yield cancelled()) {
        console.log('route saga cancelled');
      } else {
        console.log('route saga crashed', ex);
      }
    }
  }
}

// XXX @types/webpack-env should provide module.hot?
if ((module as any).hot) {
  (module as any).hot.addDisposeHandler(function () {
    window.removeEventListener('popstate', handleCurrentRoute);
  });
}
