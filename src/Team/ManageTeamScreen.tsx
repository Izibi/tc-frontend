
import * as React from 'react';
import {Button, Switch, Icon} from "@blueprintjs/core";
import {Moment} from 'moment';

import {Entity, Team, User} from '../types';

type Props = {
  infos: JSX.Element | null,
  team: Team,
  onChangeAccessCode: () => void,
  onLeaveTeam: () => void,
  onChangeTeamIsOpen: (isOpen: boolean) => void,
}

type State = {
}

class ManageTeamScreen extends React.PureComponent<Props, State> {
  render() {
    const {infos, team} = this.props;
    let teamMembers : JSX.Element[] | undefined;
    console.log(team.members);
    if (team.members !== undefined) {
      teamMembers = team.members.map((member, index) =>
        <TeamMember key={index} user={member.user} joinedAt={member.joinedAt} isCreator={member.isCreator} />);
    }
    return (
      <div className="hasTeam">
        {infos}
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
                <div className="teamCode">{team.accessCode}</div>
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
            checked={team.isOpen} onChange={this.handleChangeTeamOpen}
            label="Accept new members" />
        </div>
      </div>
    );
  }
  handleChangeAccessCode = () => {
    this.props.onChangeAccessCode();
  };
  handleLeaveTeam = () => {
    this.props.onLeaveTeam();
  };
  handleChangeTeamOpen = () => {
    this.props.onChangeTeamIsOpen(!this.props.team.isOpen);
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

export default ManageTeamScreen;
