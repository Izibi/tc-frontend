
import * as React from "react";
import {Button} from "@blueprintjs/core";
import {connect} from "react-redux";

import {actionCreators, DispatchProp, State} from "../app";
import {Link} from "../router";
import {Entity, User, Contest} from "../types";
import {selectors} from "../Backend";

type OuterProps = {}

type StoreProps = {
  loaded: boolean,
  contestId: string,
  taskResourceIndex: number,
  user: Entity<User>,
  contest: Entity<Contest>,
  here: string,
}

type Props = OuterProps & StoreProps & DispatchProp

function mapStateToProps (state: State, _props: OuterProps): StoreProps {
  const {userId, contestId, taskResourceIndex, route} = state;
  const here = route ? route.rule.name : '';
  const user = selectors.getUser(state, userId);
  const contest = selectors.getContest(state, contestId);
  return {loaded: true, contestId, taskResourceIndex, user, contest, here};
}

class Header extends React.PureComponent<Props> {
  render() {
    const {contestId, taskResourceIndex, user, contest, here} = this.props;
    return (
      <div>
        <div className="platformHeader">
          <div className="contestHead">
            <div className="platformLogo"><span>{"T"}</span><span>{"C"}</span></div>
            {'value' in contest && <div className="contestTitle">{contest.value.title}</div>}
          </div>
          <div className="chainHead">
            {'value' in contest && 'value' in contest.value.current_period &&
              <div className="contestPeriod">{"Day"}<span className="dayNumber">{contest.value.current_period.value.day_number}</span></div>}
            <div className="chainStatus">
              <div className="day"></div>
              <div className="rounds"></div>
            </div>
            {'value' in user &&
               <Button text={`Hello, ${user.value.firstname} ${user.value.lastname}`} onClick={this.handleLogout} className="logOut" rightIcon="log-out" />}
          </div>
        </div>
        <div className="mainMenu">
           <ul>
             <MenuItem active={here === 'TaskResources'} to="TaskResources" params={{contestId: contestId, resourceIndex: taskResourceIndex}} text="Task" />
             <MenuItem active={here === 'TeamManagement'} to="TeamManagement" params={{contestId: contestId}} text="Team" />
             <MenuItem active={/ChainsPage|ChainPage|BlockPage/.test(here)} to="ChainsPage" params={{contestId: contestId}} text="Chains" />
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

type MenuItemProps = {
  active: boolean,
  to: string,
  params: object,
  text: string,
}

function MenuItem(props: MenuItemProps) {
  const {active, to, params, text} = props;
  return (
    <li className={active ? "active" : ""}>
      <Link to={to} params={params} text={text} />
    </li>
  );
}

export default connect(mapStateToProps)(Header);
