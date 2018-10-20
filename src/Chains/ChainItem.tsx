
import * as React from 'react';
import * as classnames from 'classnames';

import {Link} from '../router';
import {BlockInfo, Chain, Entity, EntityState} from '../types';

type ChainItemProps = {
  item: Entity<Chain>,
  selected: boolean,
  onSelect: (chain: Chain) => void,
}

class ChainItem extends React.PureComponent<ChainItemProps> {
  render () {
    const {item, selected} = this.props;
    let body: JSX.Element | null = null;
    let loading =  false;
    switch (item.state) {
      case EntityState.Null:
        body = <p>{"null"}</p>;
        break;
      case EntityState.Thunk:
      case EntityState.Loading:
        body = <p>{"loading"}</p>;
        loading = true;
        break;
      case EntityState.Loaded:
        body = this.renderContent(item.value);
        break;
      case EntityState.Reloading:
        body = this.renderContent(item.value);
        loading = true;
        break;
      case EntityState.Error:
        return <p>{"error"}</p>;
    }
    return (
      <div className={classnames(["chainListItem", selected ? "selected" : "selectable", loading && "loading"])} onClick={this.handleClick}>
        {body}
      </div>
    );
  }
  renderContent (chain: Chain) {
    const blocks : JSX.Element[] = [];
    if (chain.game !== null) {
      const maxSeq = chain.game.blocks.size - 1;
      const nBlocks = 16;
      const maxRound = chain.game.currentRound;
      for (let i = 0; i < nBlocks; i++) {
        const block : BlockInfo = chain.game.blocks.get(maxSeq - i);
        if (block && maxRound - i >= 0) {
          const classes = ["chainBlock", "pixelated", `block-${maxRound - i}`, `seq-${maxSeq - i}`];
          const imgUrl = `${process.env.BLOCKSTORE_URL}/${block.hash}/map.png`;
          blocks[nBlocks - i - 1] = (
            <Link key={i} to="BlockPage" params={{contestId: chain.contest.id, chainId: chain.id, blockHash: block.hash}} >
              <img className={classnames(classes)} src={imgUrl} title={`${maxRound - i}`} />
            </Link>
          );
        } else {
          blocks[nBlocks - i - 1] = <div key={i} className={classnames(["chainBlock", "placeholder", `block-${maxRound - i}`])}/>
        }
      }
    }
    return (
      <div className="chainListItemContent flexRow">
        <div className="chainName">
          <Link to="ChainPage" text={chain.title} params={{contestId: chain.contest.id, chainId: chain.id}}/>
        </div>
        <div className="chainTeam">
          {chain.owner.isLoaded
            ? chain.owner.value.name
            : 'unknown'}
        </div>
        <div className="chainApproved">{chain.nbVotesApprove}</div>
        <div className="chainRejected">{chain.nbVotesReject}</div>
        <div className="chainBlocks">
          {blocks}
        </div>
      </div>
    );
  }
  handleClick = () => {
    const {item, onSelect} = this.props;
    if (item.isLoaded) {
      onSelect(item.value);
    }
  };
}

export default ChainItem;
