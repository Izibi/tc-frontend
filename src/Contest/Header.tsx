
import * as React from 'react';
import {Button} from "@blueprintjs/core";
import {connect} from 'react-redux';

import {actionCreators, DispatchProp} from '../app';
import {User, Contest, ContestPeriod} from '../types';
import {Json} from '../components';

import {ContestState} from './types';

type OuterProps = {}

type StoreProps = {
  user: User | undefined,
  contest: Contest | undefined,
  contestPeriod: ContestPeriod | undefined,
}

type Props = OuterProps & StoreProps & DispatchProp

function mapStateToProps (state: ContestState, _props: OuterProps): StoreProps {
  const {user, contest, contestPeriod} = state;
  return {user, contest, contestPeriod};
}

class Header extends React.PureComponent<Props> {
  render() {
    const {user, contest, contestPeriod} = this.props;
    if (!contest) return false;
    return (
      <div className="platformHeader">
        <div className="platformLogo"><span>{"T"}</span><span>{"C"}</span></div>
        <div className="contestTitle">{contest.title}</div>
        {user &&
           <Button text={`Hello, ${user.firstname} ${user.lastname}`} onClick={this.handleLogout} icon='log-out' />}
        <Json value={contestPeriod || {}} />
      </div>
    );
  }
  handleLogout = () => {
    this.props.dispatch(actionCreators.userLoggedOut());
  };
}

export default connect(mapStateToProps)(Header);
