
import * as React from 'react';
import {connect} from 'react-redux';
import {Button, Switch, Icon} from "@blueprintjs/core";

import {DispatchProp} from '../app';
import {Header as ContestHeader} from '../Contest';
import {User, Team} from '../types';
import {Json} from '../components';
//import {Link} from '../router';

import {TeamState, TeamManagementParams} from './types';

type StoreProps = {
  user: User | undefined,
  team: Team | undefined,
}

type Props = TeamManagementParams & StoreProps & DispatchProp

function mapStateToProps (state: TeamState, props: TeamManagementParams): StoreProps {
  const {user, team} = state;
  return {user, team};
}

class TeamManagementPage extends React.PureComponent<Props> {
  render () {
    const {user, team} = this.props;
    return (
      <div>
        <ContestHeader/>
        <div className="pageContent">
          {!team &&
            <div>{"Get started in a team!"}</div>}
          <p>{"You may participate individually, or as a team of 1 to 3"}</p>
          <p>{"Teams can be created or modified until the 10/09/2018 at 20:00 pm"}</p>
          {team &&
            <div className="teamDetails">
              <div className="sectionTitle">{"Team name"}</div>
              <div className="teamName">{team.name}</div>
              <div className="flexRow">
                <div className="teamMembersSection">
                  <div className="sectionTitle">{"Your team members"}</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Login</th>
                        <th>Firstname Lastname</th>
                        <th>Status</th>
                        <th>Member since</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="teamCodeSection">
                  <div className="sectionTitle">{"Team access code"}</div>
                  <div className="teamCodeFrame">
                    <div className="teamCode">{team.access_code}</div>
                    <Button type="button" text="Change code" />
                  </div>
                  <div className="lightText">{"Give this code to each person you want to invite to your team."}</div>
                </div>
                <div className="teamExitSection">
                  <div className="sectionTitle">{"Leave this team"}</div>
                  <Button type="button" className="teamExit">
                    <Icon icon="arrow-right" iconSize={40} />
                  </Button>
                </div>
              </div>
              <div className="teamStatus">
                <Switch checked={team.is_open} label="Accept new members" alignIndicator="right" large inline />
              </div>
            </div>
          }
        </div>
        {user && <Json value={user}/>}
        {team && <Json value={team}/>}
      </div>
    );
  }
}

export default connect(mapStateToProps)(TeamManagementPage);
