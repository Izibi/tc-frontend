
import * as React from 'react';
import {connect} from 'react-redux';

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
        <p>{"Team Management here"}</p>
        {user && <Json value={user}/>}
        {team && <Json value={team}/>}
      </div>
    );
  }
}

export default connect(mapStateToProps)(TeamManagementPage);
