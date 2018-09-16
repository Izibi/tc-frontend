
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
  chains?: Entity<Chain>[],
  teams: Team[],
}

type Props = StoreProps & DispatchProp

function mapStateToProps (state: State, _props: object): StoreProps {
  const {route, contestId, chainIds, chainId, blockHash} = state;
  const here = route ? route.rule.name : '';
  try {
    const chains = chainIds.map(id => selectors.getChain(state, id));
    const teams = selectors.getTeams(state);
    return {here, loaded: true, contestId, chainId, blockHash, chains, teams};
  } catch (ex) {
    return {here, loaded: false, contestId, chainId, blockHash, teams: []};
  }
}

class ChainsPage extends React.PureComponent<Props> {
  render () {
    const {here, contestId, chainId, loaded, chains, teams} = this.props;
    const tab = here === 'BlockPage' ? 'block': 'chain';
    return (
      <div className="chainsPage">
        <ContestHeader/>
        {!loaded && <Spinner/>}
        <ChainFilters teams={teams}/>
        {chains && chains.map((chain, index) =>
          <Slot<Chain> key={index} entity={chain} component={ChainItem} />)}
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
              {tab === 'chain' && <ChainTab/>}
              {tab === 'block' && <BlockTab/>}
            </div>
          </div>
          </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(ChainsPage);
