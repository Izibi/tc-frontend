
import * as React from 'react';
import {Button, Icon, InputGroup, Switch} from "@blueprintjs/core";
import {Moment} from 'moment';

import {actionCreators, DispatchProp} from '../app';
import {Entity, Team, User} from '../types';

type Props = {
  infos: JSX.Element | null,
  team: Team,
} & DispatchProp

type State = {
}

class ManageTeamScreen extends React.PureComponent<Props, State> {
  render() {
    const {infos, team} = this.props;
    let teamMembers : JSX.Element[] | undefined;
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
        <div className="teamKey">
          <InputGroup leftIcon='key' placeholder="Enter your public team key here"
            value={team.publicKey} onChange={this.handleChangeTeamKey} />
        </div>
      </div>
    );
  }
  handleChangeAccessCode = () => {
    this.props.dispatch(actionCreators.changeTeamAccessCode(this.props.team.id));
  };
  handleLeaveTeam = () => {
    this.props.dispatch(actionCreators.leaveTeam(this.props.team.id));
  };
  handleChangeTeamOpen = () => {
    const isOpen = !this.props.team.isOpen;
    this.props.dispatch(actionCreators.changeTeamIsOpen(this.props.team.id, isOpen));
  };
  handleChangeTeamKey = (ev: React.FormEvent<HTMLInputElement>) => {
    const teamKey = ev.currentTarget.value;
    this.props.dispatch(actionCreators.changeTeamKey(this.props.team.id, teamKey));
  };
}

type TeamMembersProps = {
  user: Entity<User>,
  joinedAt: Moment,
  isCreator: boolean,
}

const TeamMember : React.StatelessComponent<TeamMembersProps> = (props) => {
  const {user, joinedAt, isCreator} = props;
  if (!user.isLoaded) return null;
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
