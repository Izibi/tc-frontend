
import * as React from 'react';

import {Chain} from '../types';

type ChainItemProps = {
  value: Chain,
  reloading: boolean,
}

class ChainItem extends React.PureComponent<ChainItemProps> {
  render () {
    const {value: chain} = this.props;
    return (
      <div className="flexRow chainListItem">
        <div className="chainName">{chain.title}</div>
        <div className="chainTeam">
          {'value' in chain.owner
            ? chain.owner.value.name
            : 'nobody'}
        </div>
        <div className="chainApproved">{chain.nbVotesApprove}</div>
        <div className="chainRejected">{chain.nbVotesReject}</div>
        <div>{"TODO: display chain blocks"}</div>
      </div>
     );
  }
}

export default ChainItem;
