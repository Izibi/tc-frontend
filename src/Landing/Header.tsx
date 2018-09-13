
import * as React from 'react';
import {Button} from "@blueprintjs/core";
import {connect} from 'react-redux';

import {actionCreators, DispatchProp} from '../app';
import {User} from '../types';
import {selectors} from '../Backend';

import {LandingState} from './types';

type OuterProps = {
}

type StoreProps = {
  user: User | undefined,
}

type Props = StoreProps & DispatchProp

function mapStateToProps (state: LandingState, _props: OuterProps): StoreProps {
  const {userId} = state;
  try {
    return {
      user: userId === 'unknown' ? undefined : selectors.getUser(state, userId)
    }
  } catch (ex) {
    return {user: undefined};
  }
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
           <Button text={`Hello, ${user.firstname} ${user.lastname}`} onClick={this.handleLogout} className="logOut" rightIcon='log-out' />}
      </div>
    );
  }
  handleLogout = () => {
    this.props.dispatch(actionCreators.userLoggedOut());
  };
}

export default connect(mapStateToProps)(Header);
