
import * as React from 'react';
import {AnchorButton} from "@blueprintjs/core";
import {connect} from 'react-redux';

import {DispatchProp} from '../app';
import {Entity, User} from '../types';
import {selectors} from '../Backend';

import {LandingState} from './types';

type OuterProps = {
}

type StoreProps = {
  user: Entity<User>,
}

type Props = StoreProps & DispatchProp

function mapStateToProps (state: LandingState, _props: OuterProps): StoreProps {
  const {userId} = state;
  const user = selectors.getUser(state, userId);
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
        {'value' in user &&
          <AnchorButton href={`${process.env.BACKEND_URL}/Logout`} target="login"
            className="logOut"
            text={`Hello, ${user.value.firstname} ${user.value.lastname}`} />}
      </div>
    );
  }
}

export default connect(mapStateToProps)(Header);
