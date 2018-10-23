
import * as React from 'react';
import {Button, Icon, InputGroup, Switch} from "@blueprintjs/core";

import {actionCreators, DispatchProp} from '../app';
import {Team, TeamMember} from '../types';

type Props = {
  infos: JSX.Element | null,
  team: Team,
} & DispatchProp

type State = {
}

class ManageTeamScreen extends React.PureComponent<Props, State> {
  render() {
    const {infos, team} = this.props;
    let teamMembers : JSX.Element[] = [];
    if (team.members) {
      team.members.forEach((member, index) =>
        teamMembers.push(member.isLoaded
          ? <TeamMember key={index} member={member.value} />
          : <div/>));
    }
    const isPublicKeyValid = /^[A-Za-z0-9/_]+=*.ed25519$/.test(team.publicKey);
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
        <div className="sectionTitle">{"Team public key"}</div>
        <div className="teamKey">
          <InputGroup leftIcon='key' placeholder="Enter your public team key here"
            value={team.publicKey} onChange={this.handleChangeTeamKey}
            intent={isPublicKeyValid ? "success" : "danger"} />
        </div>
      </div>
    );
  }
  handleChangeAccessCode = () => {
    this.props.dispatch(actionCreators.changeTeamAccessCode(this.props.team.id));
  };
  handleLeaveTeam = () => {
    let message = "Are you sure you want to leave the team?";
    if (confirm(message)) {
      this.props.dispatch(actionCreators.leaveTeam(this.props.team.id));
    }
  };
  handleChangeTeamOpen = () => {
    const isOpen = !this.props.team.isOpen;
    this.props.dispatch(actionCreators.changeTeamIsOpen(this.props.team.id, isOpen));
  };
  handleChangeTeamKey = (ev: React.FormEvent<HTMLInputElement>) => {
    const teamKey = ev.currentTarget.value.trim();
    this.props.dispatch(actionCreators.changeTeamKey(this.props.team.id, teamKey));
  };
}

type TeamMembersProps = {
  member: TeamMember,
}

const TeamMember : React.StatelessComponent<TeamMembersProps> = (props) => {
  const {member} = props;
  if (!member.user.isLoaded) return null;
  const {username, firstname, lastname} = member.user.value;
  return (
    <tr>
      <td>{username}</td>
      <td>{firstname}{" "}{lastname}</td>
      <td>{member.isCreator &&
        <span>{"Creator"}</span>}</td>
      <td>{member.joinedAt.format('YYYY-MM-DD, hh:mm a')}</td>
    </tr>
  );
};

export default ManageTeamScreen;
