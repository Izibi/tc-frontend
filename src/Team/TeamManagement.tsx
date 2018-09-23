
import * as React from 'react';
import {connect} from 'react-redux';

import {State, DispatchProp, actionCreators} from '../app';
import {Header as ContestHeader} from '../Contest';
import {Entity, EntityState, Contest, Team, User} from '../types';
import {Spinner, Json} from '../components';
import {selectors} from '../Backend';
import CreateJoinScreen from './CreateJoinScreen';
import ManageTeamScreen from './ManageTeamScreen';
//import {Link} from '../router';

type StoreProps = {
  loading: boolean,
  user: Entity<User>,
  contestId: string,
  contest: Entity<Contest>,
  team: Entity<Team>,
}

type Props = StoreProps & DispatchProp

function mapStateToProps (state: State): StoreProps {
  const {userId, contestId, teamId} = state;
  const user = selectors.getUser(state, userId);
  const contest = selectors.getContest(state, contestId);
  const team = selectors.getTeam(state, teamId);
  const loading =
    user.state === EntityState.Loading ||
    contest.state === EntityState.Loading ||
    team.state === EntityState.Loading;
  return {loading, user, contestId, contest, team};
}

class TeamManagementPage extends React.PureComponent<Props> {
  render () {
    const {loading, user, contest, team} = this.props;
    const contestInfos = 'value' in contest ?
      <div>
        <p>{"You may participate individually, or as a team of 1 to 3"}</p>
        <p>
          {"Teams can be created or modified until the "}
          {contest.value.registrationClosesAt.format('L')}
          {" at "}
          {contest.value.registrationClosesAt.format('LT')}
        </p>
      </div> : null;
    return (
      <div>
        <ContestHeader/>
        <div className="pageContent teamManagement">

          {loading && <Spinner/>}

          {team.state === EntityState.Null &&
            <CreateJoinScreen infos={contestInfos}
              onCreate={this.handleCreateTeam} onJoin={this.handleJoinTeam} />}

          {'value' in team &&
            <ManageTeamScreen infos={contestInfos} team={team.value}
              onChangeAccessCode={this.handleChangeAccessCode}
              onLeaveTeam={this.handleLeaveTeam}
              onChangeTeamIsOpen={this.handleChangeTeamOpen} />}
        </div>
        <Json value={user}/>
        <Json value={contest}/>
        {team && <Json value={team}/>}
      </div>
    );
  }
  handleCreateTeam = (teamName: string) => {
    this.props.dispatch(actionCreators.createTeam(this.props.contestId, teamName));
  };
  handleJoinTeam = (accessCode: string) => {
    this.props.dispatch(actionCreators.joinTeam(this.props.contestId, accessCode));
  };
  handleChangeAccessCode = () => {
    if ('value' in this.props.team) {
      this.props.dispatch(actionCreators.changeTeamAccessCode(this.props.team.id));
    }
  };
  handleLeaveTeam = () => {
    if ('value' in this.props.team) {
      this.props.dispatch(actionCreators.leaveTeam(this.props.team.id));
    }
  };
  handleChangeTeamOpen = (isOpen: boolean) => {
    if ('value' in this.props.team) {
      this.props.dispatch(actionCreators.changeTeamOpen(this.props.team.id, isOpen));
    }
  };
}

export default connect(mapStateToProps)(TeamManagementPage);
