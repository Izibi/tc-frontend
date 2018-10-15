
import * as React from 'react';

import {Block, Chain} from '../types';

type ChainItemProps = {
  value: Chain,
  reloading: boolean,
}

class ChainItem extends React.PureComponent<ChainItemProps> {
  render () {
    const {value: chain} = this.props;
    console.log('game', chain.game);
    const blocks : JSX.Element[] = chain.game === null ? [] : chain.game.blocks.map((block: Block | undefined, key: number | undefined) => {
      if (block) {
        return <img key={key} className="chainBlock pixelated" src={`${process.env.BLOCKSTORE_URL}/${block.hash}/map.png`}/>
      } else {
        return <div key={key} className="chainBlock placeholder"/>
      }
    }).toArray();
    return (
      <div className="chainListItem">
        <div className="chainListItemContent flexRow">
          <div className="chainName">{chain.title}</div>
          <div className="chainTeam">
            {'value' in chain.owner
              ? chain.owner.value.name
              : 'nobody'}
          </div>
          <div className="chainApproved">{chain.nbVotesApprove}</div>
          <div className="chainRejected">{chain.nbVotesReject}</div>
          <div className="chainBlocks">
            {blocks}
          </div>
        </div>
      </div>
     );
  }
}

export default ChainItem;
