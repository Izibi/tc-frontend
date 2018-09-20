
import * as React from 'react';
import {connect} from 'react-redux';
import {AnchorButton} from '@blueprintjs/core';

import {DispatchProp} from '../app';

import {LandingState} from './types';
import Header from './Header';

type RouteProps = {}

type StoreProps = {}

type Props = RouteProps & StoreProps & DispatchProp

function mapStateToProps (state: LandingState, _props: RouteProps): StoreProps {
  return {};
}

class UnauthenticatedUserPage extends React.PureComponent<Props> {
  render () {
    return (
      <div>
        <Header />
        <p>{"UnauthenticatedUser Landing Page"}</p>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh'}}>
          <AnchorButton href="https://home.epixode.fr/tezos/backend/Login" target="login" text="Log in"/>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(UnauthenticatedUserPage);
