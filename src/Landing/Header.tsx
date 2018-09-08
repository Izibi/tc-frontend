
import * as React from 'react';
import {Button} from "@blueprintjs/core";
import {connect} from 'react-redux';

import {actionCreators, DispatchProp} from '../app';
import {User} from '../types';

import {LandingState} from './types';

type OuterProps = {
}

type StoreProps = {
  user: User | undefined,
}

type Props = StoreProps & DispatchProp

function mapStateToProps (state: LandingState, _props: OuterProps): StoreProps {
  const {user} = state;
  return {user};
}

class Header extends React.PureComponent<Props> {
  render () {
    const {user} = this.props;
    return (
      <div className="landingHeader">
        <div className="landingTitle">
          {"Tezos Contests"}
        </div>
        {user &&
           <Button text={`Hello, ${user.firstname} ${user.lastname}`} onClick={this.handleLogout} />}
      </div>
    );
  }
  handleLogout = () => {
    this.props.dispatch(actionCreators.userLoggedOut());
  };
}

export default connect(mapStateToProps)(Header);
