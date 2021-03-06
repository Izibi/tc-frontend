
import * as React from 'react';
import {connect} from 'react-redux';
//import {Select} from "@blueprintjs/select";

import {State, DispatchProp, actionCreators} from '../app';
import {Header as ContestHeader} from '../Contest';
import {Entity, Chain, BlockData, Contest, ChainFilters} from '../types';
import {Link, navigate} from '../router';
import {selectors} from '../Backend';
import ChainFilterControls from './ChainFilters';
import ChainItem from './ChainItem';
import ChainTab from './ChainTab';
import BlockTab from './BlockTab';

type StoreProps = {
  here: string,
  teamId: string | null,
  contestId: string,
  contest: Entity<Contest>,
  // chain filters
  filters: ChainFilters,
  // list of chains displayed:
  chains: Entity<Chain>[],
  // displayed index range in chains:
  firstVisible: number,
  lastVisible: number,
  // selected chain:
  chainId: string,
  chain: Entity<Chain>,
  isOwner: boolean,
  // selected block:
  blockHash: string,
  blockData: BlockData,
}

type Props = StoreProps & DispatchProp

function mapStateToProps (state: State, _props: object): StoreProps {
  let {route, teamId, contestId, chainIds, chainId, blockHash, chainFilters} = state;
  const {firstVisible, lastVisible} = state.chainList;
  const here = route ? route.rule.name : '';
  const chains = chainIds.map(id => selectors.getChain(state, id)); /* XXX allocation */
  const chain = selectors.getChain(state, chainId);
  const contest = selectors.getContest(state, contestId);
  let isOwner = false;
  if (chain.isLoaded) {
    if (teamId !== null && chain.value.ownerId === teamId) {
      isOwner = true;
    }
    if (blockHash === 'last') {
      if (chain.value.game) {
        blockHash = chain.value.game.lastBlock;
      } else {
        blockHash = "";
        console.log('game not loaded, cannot display last block');
      }
    }
  }
  const blockData = selectors.getBlockData(state, blockHash);
  return {
    here, teamId, contestId, contest,
    filters: chainFilters, chains, firstVisible, lastVisible,
    chainId, chain, isOwner,
    blockHash, blockData,
  };
}

class ChainsPage extends React.PureComponent<Props> {
  render () {
    const {here, teamId, contestId, chainId, chains, contest, chain, isOwner, blockData, filters} = this.props;
    if (teamId === null) {
      return (
        <div className="chainsPage">
          <ContestHeader/>
          <p>{"Join a team to access the chains."}</p>
        </div>
      );
    }
    const tab = here === 'BlockPage' ? 'block': 'chain';
    return (
      <div className="chainsPage">
        <ContestHeader/>
        {contest.isLoaded && <ChainFilterControls filters={filters} onChange={this.handleFilterChange} teams={contest.value.teams} />}
        <div className="chainList">
          <div className="flexRow">
            <div className="chainListTitle chainName">{"Name"}</div>
            <div className="chainListTitle chainTeam">{"Team"}</div>
            <div className="chainListTitle chainApproved">{"Approved"}</div>
            <div className="chainListTitle chainRejected">{"Rejected"}</div>
          </div>
          <div className="chainListItems" ref={this.refList} onScroll={this.handleChainListScroll}>
            {chains && chains.map((item, index) =>
              <ChainItem key={index} item={item} selected={item === chain} onSelect={this.handleSelectChain} />)}
            {(!chains || chains.length === 0) &&
              <p className="noItems">{"No results"}</p>}
          </div>
        </div>
        <div className="tabLayout">
          <div className="tabSelector">
            <div className={tab === 'block' ? "selected" : ""}>
              <Link to="BlockPage" text="Block" params={{contestId, chainId, blockHash: 'last'}}/>
            </div>
            <div className={tab === 'chain' ? "selected" : ""}>
              <Link to="ChainPage" text="Chain" params={{contestId, chainId}}/>
            </div>
          </div>
          <div className="pageContent">
            <div>
            </div>
            <div>
              {tab === 'chain' && chain.isLoaded &&
                <ChainTab chain={chain.value} isOwner={isOwner} dispatch={this.props.dispatch} />}
              {tab === 'block' &&
                <BlockTab data={blockData} game={chain.isLoaded ? chain.value.game : null} />}
            </div>
          </div>
          </div>
      </div>
    );
  }
  refList : React.RefObject<HTMLDivElement> = React.createRef();
  componentDidMount () {
    this.updateVisibleRange();
  }
  componentDidUpdate () {
    this.updateVisibleRange();
  }
  updateVisibleRange () {
    const items = this.refList.current;
    if (items === null) return;
    const firstItem = items.firstChild as HTMLDivElement | null;
    if (firstItem === null) return;
    const pos = items.scrollTop / firstItem.clientHeight;
    const firstIndex = Math.trunc(pos);
    const lastIndex = Math.ceil(pos + (items.clientHeight / firstItem.clientHeight)) - 1;
    if (this.props.firstVisible !== firstIndex || this.props.lastVisible !== lastIndex) {
      this.props.dispatch(actionCreators.chainListScrolled(firstIndex, lastIndex));
    }
  };
  handleChainListScroll = (event: React.UIEvent<HTMLDivElement>) => {
    this.updateVisibleRange();
  };
  handleSelectChain = (chain: Chain) => {
    navigate("ChainPage", {contestId: chain.contest.id, chainId: chain.id});
  };
  handleFilterChange = (changes: object) => {
    this.props.dispatch(actionCreators.chainFiltersChanged(changes));
  };
}

export default connect(mapStateToProps)(ChainsPage);
