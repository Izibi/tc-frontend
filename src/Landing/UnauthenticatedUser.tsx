
import * as React from 'react';
import {connect} from 'react-redux';

import {DispatchProp} from '../app';

import {LandingState} from './types';
import Header from './Header';

type RouteProps = {}

type StoreProps = {}

type Props = RouteProps & StoreProps & DispatchProp

class UnauthenticatedUserPage extends React.PureComponent<Props> {
  render () {
    return (
      <div>
        <Header />
        <p>{"UnauthenticatedUser Landing Page"}</p>
      </div>
    );
  }
}

function mapStateToProps (_state: LandingState, _props: RouteProps): StoreProps {
  return {};
}

export default connect(mapStateToProps)(UnauthenticatedUserPage);
