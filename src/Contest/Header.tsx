
import * as React from "react";
import {Button} from "@blueprintjs/core";
import {connect} from "react-redux";

import {actionCreators, DispatchProp, State} from "../app";
import {Link} from "../router";
import {User, Contest} from "../types";
import {selectors} from "../Backend";

type OuterProps = {}

type StoreProps = {
  loaded: boolean,
  contestId: string,
  taskResourceIndex: number,
  user?: User,
  contest?: Contest,
  here: string,
}

type Props = OuterProps & StoreProps & DispatchProp

function mapStateToProps (state: State, _props: OuterProps): StoreProps {
  const {userId, contestId, taskResourceIndex, route} = state;
  const here = route ? route.rule.name : '';
  try {
    const user = selectors.getUser(state, userId);
    const contest = selectors.getContest(state, contestId);
    return {loaded: true, contestId, taskResourceIndex, user, contest, here};
  } catch (ex) {
    return {loaded: false, contestId, taskResourceIndex, here};
  }
}

class Header extends React.PureComponent<Props> {
  render() {
    const {contestId, taskResourceIndex, user, contest, here} = this.props;
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
               <Button text={`Hello, ${user.firstname} ${user.lastname}`} onClick={this.handleLogout} className="logOut" rightIcon="log-out" />}
          </div>
        </div>
        <div className="mainMenu">
           <ul>
             <MenuItem here={here} to="TaskResources" params={{contestId: contestId, resourceIndex: taskResourceIndex}} text="Task" />
             <MenuItem here={here} to="TeamManagement" params={{contestId: contestId}} text="Team" />
             <MenuItem here={here} to="ChainsPage" params={{contestId: contestId}} text="Chains" />
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
  here: string,
  to: string,
  params: object,
  text: string,
}

function MenuItem(props: MenuItemProps) {
  const {here, to, params, text} = props;
  return (
    <li className={here === to ? "active" : ""}>
      <Link to={to} params={params} text={text} />
    </li>
  );
}

export default connect(mapStateToProps)(Header);
