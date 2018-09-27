
import * as React from 'react';
import {connect} from 'react-redux';
//import {Select} from "@blueprintjs/select";

import {State, DispatchProp} from '../app';
import {Header as ContestHeader} from '../Contest';
import {Entity, Chain, Team} from '../types';
import {Link} from '../router';
import {Slot, Spinner} from '../components';
import {selectors} from '../Backend';
import ChainFilters from './ChainFilters';
import ChainItem from './ChainItem';
import ChainTab from './ChainTab';
import BlockTab from './BlockTab';

type StoreProps = {
  here: string,
  loaded: boolean,
  contestId: string,
  chainId: string,
  blockHash: string,
  chains: Entity<Chain>[],
  teams: Team[],
  chain: Entity<Chain>,
  isOwner: boolean,
}

type Props = StoreProps & DispatchProp

function mapStateToProps (state: State, _props: object): StoreProps {
  const {route, teamId, contestId, chainIds, chainId, blockHash} = state;
  const here = route ? route.rule.name : '';
  const chains = chainIds.map(id => selectors.getChain(state, id));
  const chain = selectors.getChain(state, "1" /* XXX chainId*/);
  const teams = selectors.getTeams(state);
  let loaded = false;
  let isOwner = false;
  if ('value' in chain) {
    loaded = true;
    if (teamId !== null && chain.value.ownerId === teamId) {
      isOwner = true;
    }
  }
  return {here, loaded, contestId, chainId, blockHash, chains, teams, chain, isOwner};
}

class ChainsPage extends React.PureComponent<Props> {
  render () {
    const {here, contestId, chainId, loaded, chains, teams, chain, isOwner} = this.props;
    const tab = here === 'BlockPage' ? 'block': 'chain';
    return (
      <div className="chainsPage">
        <ContestHeader/>
        {!loaded && <Spinner/>}
        <ChainFilters teams={teams}/>
        <div className="chainList">
          <div className="flexRow">
            <div className="chainListTitle chainName">{"Name"}</div>
            <div className="chainListTitle chainTeam">{"Team"}</div>
            <div className="chainListTitle chainApproved">{"Approved"}</div>
            <div className="chainListTitle chainRejected">{"Rejected"}</div>
          </div>
          <div className="chainListItems">
            {chains && chains.map((chain, index) =>
              <Slot<Chain> key={index} entity={chain} component={ChainItem} />)}
          </div>
        </div>
        <div className="tabLayout">
          <div className="tabSelector">
            <div className={tab === 'block' ? "selected" : ""}>
              <Link to="BlockPage" text="Block" params={{contestId, chainId, blockHash: 'unknown'}}/>
            </div>
            <div className={tab === 'chain' ? "selected" : ""}>
              <Link to="ChainPage" text="Chain" params={{contestId, chainId}}/>
            </div>
          </div>
          <div className="pageContent">
            <div>
            </div>
            <div>
              {tab === 'chain' && 'value' in chain && <ChainTab chain={chain.value} isOwner={isOwner} dispatch={this.props.dispatch} />}
              {tab === 'block' && <BlockTab/>}
            </div>
          </div>
          </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(ChainsPage);
