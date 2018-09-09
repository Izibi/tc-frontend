
import * as React from 'react';
import {connect} from 'react-redux';

import {Route, RouterState} from './types';

type RouterProps = {
  path: string,
  route: Route | undefined
};

function BareRouter (props: RouterProps) {
  const {route} = props;
  if (route) {
    return React.createElement(route.rule.component, route.params);
  } else {
    return <NotFound path={props.path}/>;
  }
}

export const Router = connect(function (state: RouterState) : RouterProps {
  const {path, route} = state;
  return {path, route};
})(BareRouter);

function NotFound (props: {path: string}) {
  return <p>{"bad route: "}{props.path}</p>
}
