
import * as React from 'react';
import {connect} from 'react-redux';
import {Button, Switch, Icon} from "@blueprintjs/core";
import {Moment} from 'moment';

import {State, DispatchProp, actionCreators} from '../app';
import {Header as ContestHeader} from '../Contest';
import {Contest, Team, User} from '../types';
import {Spinner, Json} from '../components';
import {selectors} from '../Backend';
//import {Link} from '../router';

import {TeamManagementParams} from './types';

type StoreProps = {
  loaded: boolean,
  user?: User,
  contest?: Contest,
  team?: Team,
}

type Props = TeamManagementParams & StoreProps & DispatchProp

function mapStateToProps (state: State, props: TeamManagementParams): StoreProps {
  try {
    const {userId, contestId, teamId} = state;
    const user = selectors.getUser(state, userId);
    const contest = selectors.getContest(state, contestId);
    const team = selectors.getTeam(state, teamId);
    return {loaded: true, user, contest, team};
  } catch (ex) {
    return {loaded: false};
  }
}

class TeamManagementPage extends React.PureComponent<Props> {
  render () {
    let teamMembers : JSX.Element[] | undefined;
    const {loaded, user, contest, team} = this.props;
    const contestInfos = contest &&
      <div>
        <p>{"You may participate individually, or as a team of 1 to 3"}</p>
        <p>
          {"Teams can be created or modified until the "}
          {contest.registration_closes_at.format('L')}
          {" at "}
          {contest.registration_closes_at.format('LT')}
        </p>
      </div>;
    if (team) {
      teamMembers = team.members.map((member, index) =>
        <TeamMember key={index} user={member.user} joinedAt={member.joined_at} isCreator={member.is_creator} />);
    }
    return (
      <div>
        <ContestHeader/>
        <div className="pageContent teamManagement">

          {!loaded && <Spinner/>}

          {loaded && team === undefined && <div>
            <div style={{fontSize: "18px", marginBottom: "1em"}}>
              {"Get started in a team!"}
            </div>
            {contestInfos}
            <div className="flexRow notInTeam">
              <div className="teamSection creation">
                <div>
                  <div className="sectionTitle">{"Create new team"}</div>
                  <div><input type="text" placeholder="Team name"/> <Button text="Create"/></div>
                </div>
              </div>
              <div className="teamSection join">
                <div>
                  <div className="sectionTitle">{"Join an existing team"}</div>
                  <div><input type="text" placeholder="Team code"/> <Button text="Join"/></div>
                </div>
              </div>
            </div>
          </div>}

          {loaded && typeof team === 'object' &&
            <div className="hasTeam">
              {contestInfos}
              <div className="sectionTitle">{"Team name"}</div>
              <div className="teamName">{team.name}</div>
              <div className="flexRow">
                <div className="teamSection members">
                  <div>
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
                        {teamMembers}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="teamSection code">
                  <div>
                    <div className="sectionTitle">{"Team access code"}</div>
                    <div className="teamCodeFrame">
                      <div className="teamCode">{team.access_code}</div>
                      <Button type="button" text="Change code" onClick={this.handleChangeAccessCode} />
                    </div>
                    <div className="lightText">
                      {`Give this code to each person you want to invite to your team.`}
                    </div>
                  </div>
                </div>
                <div className="teamSection leave">
                  <div>
                    <div className="sectionTitle">{"Leave this team"}</div>
                    <Button type="button" className="leaveTeam" onClick={this.handleLeaveTeam} >
                      <Icon icon="arrow-right" iconSize={40} />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="teamStatus">
                <Switch alignIndicator="right" large inline
                  checked={team.is_open} onChange={this.handleChangeTeamOpen}
                  label="Accept new members" />
              </div>
            </div>
          }
        </div>
        <Json value={user}/>
        <Json value={contest}/>
        {team && <Json value={team}/>}
      </div>
    );
  }
  handleChangeAccessCode = () => {
    this.props.dispatch(actionCreators.changeTeamAccessCode());
  };
  handleLeaveTeam = () => {
    this.props.dispatch(actionCreators.leaveTeam());
  };
  handleChangeTeamOpen = () => {
    const {team} = this.props;
    if (typeof team === 'object') {
      this.props.dispatch(actionCreators.changeTeamOpen(!team.is_open));
    }
  };
}

type TeamMembersProps = {
  user: User,
  joinedAt: Moment,
  isCreator: boolean,
}

const TeamMember : React.StatelessComponent<TeamMembersProps> = (props) => {
  const {user: {username, firstname, lastname}, joinedAt, isCreator} = props;
  return (
    <tr>
      <td>{username}</td>
      <td>{firstname}{" "}{lastname}</td>
      <td>{isCreator &&
        <span>{"Creator"}</span>}</td>
      <td>{joinedAt.format('DD-MM-YYYY, hh:mm a')}</td>
    </tr>
  );
};

export default connect(mapStateToProps)(TeamManagementPage);
