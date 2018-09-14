
import * as React from 'react';
import {Button} from "@blueprintjs/core";
import {connect} from 'react-redux';

import {actionCreators, DispatchProp, State} from '../app';
import {Link} from '../router';
import {User, Contest} from '../types';
import {selectors} from '../Backend';

type OuterProps = {}

type StoreProps = {
  loaded: boolean,
  contestId: string,
  taskResourceIndex: number,
  user?: User,
  contest?: Contest,
}

type Props = OuterProps & StoreProps & DispatchProp

function mapStateToProps (state: State, _props: OuterProps): StoreProps {
  const {userId, contestId, taskResourceIndex} = state;
  try {
    const user = selectors.getUser(state, userId);
    const contest = selectors.getContest(state, contestId);
    return {loaded: true, contestId, taskResourceIndex, user, contest};
  } catch (ex) {
    return {loaded: false, contestId, taskResourceIndex};
  }
}

class Header extends React.PureComponent<Props> {
  render() {
    const {contestId, taskResourceIndex, user, contest} = this.props;
    return (
      <div>
        <div className="platformHeader">
          <div className="contestHead">
            <div className="platformLogo"><span>{"T"}</span><span>{"C"}</span></div>
            {contest && <div className="contestTitle">{contest.title}</div>}
          </div>
          <div className="chainHead">
            {contest &&
              <div className="contestPeriod">{"Day"}<span className="dayNumber">{contest.current_period.day_number}</span></div>}
            <div className="chainStatus">
              <div className="day"></div>
              <div className="rounds"></div>
            </div>
            {user &&
               <Button text={`Hello, ${user.firstname} ${user.lastname}`} onClick={this.handleLogout} className="logOut" rightIcon='log-out' />}
          </div>
        </div>
        <div className="mainMenu">
           <ul>
             <li><Link to="TaskResources" params={{contestId: contestId, resourceIndex: taskResourceIndex}} text="Task" /></li>
             <li><Link to="TeamManagement" params={{contestId: contestId}} text="Team" /></li>
             <li><Link to="ChainsPage" params={{contestId: contestId}} text="Chains" /></li>
             <li>{"Forum"}</li>
             <li>{"Scoreboard"}</li>
           </ul>
        </div>
      </div>
    );
  }
  handleLogout = () => {
    this.props.dispatch(actionCreators.userLoggedOut());
  };
}

export default connect(mapStateToProps)(Header);
