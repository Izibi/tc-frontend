
import {Dispatch, AnyAction} from 'redux';
import PathParser from 'path-parser'
import {all, call, cancelled, takeLatest} from 'redux-saga/effects';

import {ActionTypes, createAction} from '../app';

import {Rule, Route} from './types';

export type Matcher = {
  rule: Rule,
  parser: PathParser,
}

export const actionCreators = {
  routeChanged: (route: Route) => createAction(ActionTypes.ROUTE_CHANGED, {route}),
};

/* private state */
const prefix : string = process.env.MOUNT_PATH || "";
let matchers : Matcher[] = [];
let dispatch : Dispatch<AnyAction>;

export function addPrefix (pathname: string) {
  return `${prefix}${pathname}`;
}

function getMatcherByName (ruleName: string) : Matcher | null {
  for (const matcher of matchers) {
    if (matcher.rule.name === ruleName) {
      return matcher;
    }
  }
  return null;
}

function buildRoute (rule: Rule, pathname: string, params: object) {
  const {component} = rule;
  const route: Route = {pathname: addPrefix(pathname), component, params};
  if ('saga' in rule) {
    route.saga = rule.saga;
  }
  return route;
}

export function linkTo (ruleName: string, params: object | undefined): string {
  const matcher = getMatcherByName(ruleName);
  return matcher
    ? addPrefix(matcher.parser.build(params))
    : `no_rule_for:${ruleName}`;
}

export function navigate (ruleName: string, params: object = {}) {
  const matcher = getMatcherByName(ruleName);
  if (!matcher) {
    // TODO: dispatch router error
    throw new Error(`router has no rule named ${ruleName}`);
  }
  const pathname = addPrefix(matcher.parser.build(params));
  const route = buildRoute(matcher.rule, pathname, params);
  window.history.pushState(null, "", pathname);
  dispatch(actionCreators.routeChanged(route));
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
  for (const matcher of matchers) {
    const params = matcher.parser.test(pathname);
    if (params) {
      return buildRoute(matcher.rule, pathname, params);
    }
  }
  return null;
}

export function handleCurrentRoute () {
  dropPrefix(window.location.pathname).then(function (pathname) {
    const route = getRouteOfPath(pathname);
    if (route) {
      dispatch(actionCreators.routeChanged(route));
    }
  }).catch(function () {
    console.log("navigate to external path", window.location.pathname);
  });
}

export function startRouter (newDispatch: Dispatch<AnyAction>, rules: Rule[]) {
  console.log('routing for prefix', prefix);
  dispatch = newDispatch;
  matchers = rules.map(rule => ({rule, parser: new PathParser(rule.pattern)}));
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
  if (route.saga) {
    try {
      yield call(route.saga, route.props);
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
