
import * as React from 'react';
import {Button} from "@blueprintjs/core";

type Props = {
  infos: JSX.Element | null,
  onCreate: (teamName: string) => void,
  onJoin: (accessCode: string) => void,
}

type State = {
  teamName: string,
  accessCode: string,
}

class CreateJoinScreen extends React.PureComponent<Props, State> {
  render() {
    const {infos} = this.props;
    const {teamName, accessCode} = this.state;
    return (
      <div>
        <div style={{fontSize: "18px", marginBottom: "1em"}}>
          {"Get started in a team!"}
        </div>
        {infos}
        <div className="flexRow notInTeam">
          <div className="teamSection creation">
            <div>
              <div className="sectionTitle">{"Create new team"}</div>
              <div>
                <input type="text" placeholder="Team name" value={teamName} onChange={this.handleTeamNameChange}/>
                <Button text="Create" onClick={this.handleCreateTeam}/>
              </div>
            </div>
          </div>
          <div className="teamSection join">
            <div>
              <div className="sectionTitle">{"Join an existing team"}</div>
              <div>
                <input type="text" placeholder="Team code" value={accessCode} onChange={this.handleAccessCodeChange}/>
                <Button text="Join" onClick={this.handleJoinTeam}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  state = {
    teamName: '',
    accessCode: '',
  };
  handleTeamNameChange = (event: React.FormEvent<HTMLInputElement>) => {
    const teamName = event.currentTarget.value;
    this.setState({teamName});
  };
  handleAccessCodeChange = (event: React.FormEvent<HTMLInputElement>) => {
    const accessCode = event.currentTarget.value;
    this.setState({accessCode});
  };
  handleCreateTeam = () => {
    this.props.onCreate(this.state.teamName);
  };
  handleJoinTeam = () => {
    this.props.onJoin(this.state.accessCode);
  };
}

export default CreateJoinScreen;
