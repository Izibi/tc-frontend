
import * as React from 'react';
import {connect} from 'react-redux';

import {State, DispatchProp} from '../app';
import {Header as ContestHeader} from '../Contest';
import {Chain} from '../types';
import {Json, Spinner} from '../components';
import {selectors} from '../Backend';

type StoreProps = {
  loaded: boolean,
  chains?: Chain[],
}

type Props = StoreProps & DispatchProp

function mapStateToProps (state: State, _props: object): StoreProps {
  try {
    const {chainIds} = state;
    const chains = chainIds.map(id => selectors.getChain(state, id));
    return {loaded: true, chains};
  } catch (ex) {
    return {loaded: false};
  }
}

class ChainsPage extends React.PureComponent<Props> {
  render () {
    const {loaded, chains} = this.props;
    return (
      <div>
        <ContestHeader/>
        <div className="pageContent chainsPage">
          <p>{"Everything goes here"}</p>
          {!loaded && <Spinner/>}
          {chains && chains.map(chain =>
            <ChainItem chain={chain} />)}
        </div>
      </div>
    );
  }
}

type ChainItemProps = {
  chain: Chain
}

class ChainItem extends React.PureComponent<ChainItemProps> {
  render () {
    const {chain} = this.props;
    return <Json value={chain} />;
  }
}


export default connect(mapStateToProps)(ChainsPage);
