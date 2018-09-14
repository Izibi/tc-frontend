
import * as React from 'react';
import {connect} from 'react-redux';
import {Button, InputGroup} from "@blueprintjs/core";
//import {Select} from "@blueprintjs/select";

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
    const searchIcon = <Button icon="search" minimal/>;
    return (
      <div>
        <ContestHeader/>
        {!loaded && <Spinner/>}
        <div className="chainFilters">
          <div className="flexRow">
            <div>
              <div className="sectionTitle">Filter by Status</div>
              <div className="chainStatus">
                <Button text="Active" />
                <Button text="Private test" />
                <Button text="Public test" />
                <Button text="Candidate" />
                <Button text="Past" />
              </div>
            </div>
            <div>
              <div className="sectionTitle">Team</div>
              <select>
                <option>Team 1</option>
                <option>Team 2</option>
                <option>TODO</option>
              </select>
            </div>
            <div>
              <InputGroup type="search" placeholder="Search" rightElement={searchIcon} />
            </div>
            <div>
              <Button text="Options" rightIcon="chevron-down" />
            </div>
          </div>
        </div>
        {chains && chains.map((chain, index) =>
          <ChainItem chain={chain} key={index}/>)}
        <div className="pageContent chainsPage">
          <p>{"Everything goes here"}</p>
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
    return (
      <div>
        {chain.title}{" "}
        <Json value={chain} />
      </div>
     );
  }
}


export default connect(mapStateToProps)(ChainsPage);
