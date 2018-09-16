
import * as React from 'react';
import {Radio, RadioGroup} from "@blueprintjs/core";

import {Entity, Chain} from '../types';

type ChainTabProps = {
  chain: Entity<Chain>,
}

class ChainTab extends React.PureComponent<ChainTabProps> {
  render () {
    const {chain} = this.props;
    if (!('value' in chain)) return null; // FIXME
    const selectRound = "TODO: list rounds in select";
    return (
      <div className="flexRow">
        <div className="onehalf">
          <div className="panel">
            <div className="panelHeader">{"Chain information"}</div>
            <div className="panelBody">
              <div>{"Name "}{chain.value.title}</div>
              <div>{"By team "}{"TODO: chain owner"}</div>
              {"Status "}{chain.value.status}{" since "}{chain.value.updated_at.format('YYYY-MM-DD, hh:mm a')}
            </div>
          </div>
          <div className="panel">
            <div className="panelHeader">{"Description of the code changes"}</div>
            <div className="panelBody">
              {"TODO: chain description"}
            </div>
          </div>
          <div className="panel">
            <div className="panelHeader">{"Starting map"}</div>
            <div className="panelBody">
              <RadioGroup
                onChange={this.handleStartingMapChange}
                selectedValue={this.props.chain.state}
                >
                <Radio label="Empty map" value="one" />
                <Radio label="From chain" value="two">
                  {chain.value.title}{" "}
                  {selectRound}
                </Radio>
            </RadioGroup>
            </div>
          </div>
         </div>
         <div className="onehalf">
          <div className="panel">
            <div className="panelHeader">{"OCaml code for this chain"}</div>
            <div className="panelBody">
              {"TODO"}
            </div>
          </div>
          <div className="panel">
            <div className="panelHeader">{"OCaml implementation code for this chain"}</div>
            <div className="panelBody">
              {"TODO"}
            </div>
          </div>
        </div>
      </div>
     );
  }
  handleStartingMapChange = () => {
  };

}

export default ChainTab;
