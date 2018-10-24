
import * as React from 'react';
import {connect} from 'react-redux';

import {State, DispatchProp, actionCreators} from '../app';
import {Header as ContestHeader} from '../Contest';
import {Entity, Contest, Team} from '../types';
import {Spinner} from '../components';
import {selectors} from '../Backend';
import CreateJoinScreen from './CreateJoinScreen';
import ManageTeamScreen from './ManageTeamScreen';
//import {Link} from '../router';

type StoreProps = {
  loading: boolean,
  contestId: string,
  contest: Entity<Contest>,
  team: Entity<Team>,
}

type Props = StoreProps & DispatchProp

function mapStateToProps (state: State): StoreProps {
  const {contestId, teamId} = state;
  const contest = selectors.getContest(state, contestId);
  const team = selectors.getTeam(state, teamId);
  const loading = contest.isLoading || team.isLoading;
  return {loading, contestId, contest, team};
}

class TeamManagementPage extends React.PureComponent<Props> {
  render () {
    const {loading, contest, team, dispatch} = this.props;
    const contestInfos = contest.isLoaded ?
      <div>
        <p>{"You may participate individually, or as a team of 1 to 5"}</p>
        {false && <p>
          {"Teams can be created or modified until the "}
          {contest.value.registrationClosesAt.format('L')}
          {" at "}
          {contest.value.registrationClosesAt.format('LT')}
        </p>}
      </div> : null;
    return (
      <div>
        <ContestHeader/>
        <div className="pageContent teamManagement">

          {loading && <Spinner/>}

          {team.isNull &&
            <CreateJoinScreen infos={contestInfos}
              onCreate={this.handleCreateTeam} onJoin={this.handleJoinTeam} />}

          {team.isLoaded &&
            <ManageTeamScreen infos={contestInfos} team={team.value} dispatch={dispatch} />}
        </div>
      </div>
    );
  }
  handleCreateTeam = (teamName: string) => {
    this.props.dispatch(actionCreators.createTeam(this.props.contestId, teamName));
  };
  handleJoinTeam = (accessCode: string) => {
    this.props.dispatch(actionCreators.joinTeam(this.props.contestId, accessCode));
  };
}

export default connect(mapStateToProps)(TeamManagementPage);
