
import * as React from 'react';
import {Button} from "@blueprintjs/core";
import {connect} from 'react-redux';

import {AppToaster, Link} from '../app';
import Dev from '../components/Dev';

import {LandingState} from './types';

type RouteProps = {}

type StoreProps = {}

type Props = RouteProps & StoreProps

class UnauthenticatedUserPage extends React.PureComponent<Props> {
  render () {
    return (
      <div>
        <div className="landingTitle">{"Tezos Contests"}</div>
        <Dev>
          <Button onClick={this.toast}>{"Toast"}</Button>
          <Link to="TaskResources" params={{contestId: "1", resourceIndex: 0}}>{"test"}</Link>
        </Dev>
        <p>{"UnauthenticatedUser Landing Page"}</p>
      </div>
    );
  }
  toast = () => {
    AppToaster.show({message: "Toasty!"});
  };
}

function mapStateToProps (_state: LandingState, _props: RouteProps): StoreProps {
  return {};
}

export default connect(mapStateToProps)(UnauthenticatedUserPage);
