
import * as React from 'react';

import {Json} from '../components';
import {Chain} from '../types';

type ChainItemProps = {
  value: Chain,
  reloading: boolean,
}

class ChainItem extends React.PureComponent<ChainItemProps> {
  render () {
    const {value} = this.props;
    return (
      <div className="REMOVEMEWHEN REMOVING THE JSON">
      <div className="flexRow chainListItem">
        <div className="chainName">{value.title}</div>
        <div className="chainTeam">{"TODO: chain owner team name"}</div>
        <div className="chainApproved">{value.nbVotesApprove}</div>
        <div className="chainRejected">{value.nbVotesReject}</div>
        <div>{"TODO: display chain blocks"}</div>
      </div>
        <Json value={value} />
      </div>
     );
  }
}

export default ChainItem;
