
import * as React from 'react';
import {connect} from 'react-redux';
import {Button, InputGroup} from "@blueprintjs/core";
//import {Select} from "@blueprintjs/select";

import {State, DispatchProp} from '../app';
import {Header as ContestHeader} from '../Contest';
import {Entity, Chain} from '../types';
import {Json, Slot, Spinner} from '../components';
import {selectors} from '../Backend';

type StoreProps = {
  loaded: boolean,
  chains?: Entity<Chain>[],
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
              <div className="sectionTitle">
                {"Filter by Status"}
              </div>
              <div className="chainStatus">
                <Button text="Active" />
                <Button text="Private test" />
                <Button text="Public test" />
                <Button text="Candidate" />
                <Button text="Past" />
              </div>
            </div>
            <div>
              <div className="sectionTitle">
                {"Team"}
              </div>
              <div className="bp3-select">
                <select>
                  <option>{"Team 1"}</option>
                  <option>{"Team 2"}</option>
                  <option>{"TODO"}</option>
                </select>
              </div>
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
          <Slot<Chain> key={index} entity={chain} component={ChainItem} />)}
        <div className="pageContent chainsPage">
          <p>{"Everything goes here"}</p>
        </div>
      </div>
    );
  }
}

type ChainItemProps = {
  value: Chain,
  reloading: boolean,
}

class ChainItem extends React.PureComponent<ChainItemProps> {
  render () {
    const {value} = this.props;
    return (
      <div>
        {value.title}{" "}
        <Json value={value} />
      </div>
     );
  }
}

export default connect(mapStateToProps)(ChainsPage);
