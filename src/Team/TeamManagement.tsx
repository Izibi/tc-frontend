
import * as React from 'react';
import {connect} from 'react-redux';
import {Button, Switch, Icon} from "@blueprintjs/core";
import {Moment} from 'moment';

import {State, DispatchProp, actionCreators} from '../app';
import {Header as ContestHeader} from '../Contest';
import {Entity, EntityState, Contest, Team, User} from '../types';
import {Spinner, Json} from '../components';
import {selectors} from '../Backend';
//import {Link} from '../router';

import {TeamManagementParams} from './types';

type StoreProps = {
  loading: boolean,
  user: Entity<User>,
  contest: Entity<Contest>,
  team: Entity<Team>,
}

type Props = TeamManagementParams & StoreProps & DispatchProp

function mapStateToProps (state: State, props: TeamManagementParams): StoreProps {
  const {userId, contestId, teamId} = state;
  const user = selectors.getUser(state, userId);
  const contest = selectors.getContest(state, contestId);
  const team = selectors.getTeam(state, teamId);
  const loading =
    user.state === EntityState.Loading ||
    contest.state === EntityState.Loading ||
    team.state === EntityState.Loading;
  return {loading, user, contest, team};
}

class TeamManagementPage extends React.PureComponent<Props> {
  render () {
    let teamMembers : JSX.Element[] | undefined;
    const {loading, user, contest, team} = this.props;
    const contestInfos = 'value' in contest &&
      <div>
        <p>{"You may participate individually, or as a team of 1 to 3"}</p>
        <p>
          {"Teams can be created or modified until the "}
          {contest.value.registrationClosesAt.format('L')}
          {" at "}
          {contest.value.registrationClosesAt.format('LT')}
        </p>
      </div>;
    if ('value' in team && team.value.members !== undefined) {
      teamMembers = team.value.members.map((member, index) =>
        <TeamMember key={index} user={member.user} joinedAt={member.joinedAt} isCreator={member.isCreator} />);
    }
    return (
      <div>
        <ContestHeader/>
        <div className="pageContent teamManagement">

          {loading && <Spinner/>}

          {team.state === EntityState.Null && <div>
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

          {'value' in team &&
            <div className="hasTeam">
              {contestInfos}
              <div className="sectionTitle">{"Team name"}</div>
              <div className="teamName">{team.value.name}</div>
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
                      <div className="teamCode">{team.value.accessCode}</div>
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
                  checked={team.value.isOpen} onChange={this.handleChangeTeamOpen}
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
    if ('value' in team) {
      this.props.dispatch(actionCreators.changeTeamOpen(!team.value.isOpen));
    }
  };
}

type TeamMembersProps = {
  user: Entity<User>,
  joinedAt: Moment,
  isCreator: boolean,
}

const TeamMember : React.StatelessComponent<TeamMembersProps> = (props) => {
  const {user, joinedAt, isCreator} = props;
  if (!('value' in user)) return null;
  const {username, firstname, lastname} = user.value;
  return (
    <tr>
      <td>{username}</td>
      <td>{firstname}{" "}{lastname}</td>
      <td>{isCreator &&
        <span>{"Creator"}</span>}</td>
      <td>{joinedAt.format('YYYY-MM-DD, hh:mm a')}</td>
    </tr>
  );
};

export default connect(mapStateToProps)(TeamManagementPage);
