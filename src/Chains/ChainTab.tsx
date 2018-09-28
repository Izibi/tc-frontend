
import * as React from 'react';
import {Button, Radio, RadioGroup} from "@blueprintjs/core";
import AceEditor from 'react-ace';
import 'brace';
import 'brace/mode/ocaml';
import 'brace/theme/github';
import 'brace/worker/javascript';

import {actionCreators, DispatchProp} from '../app';
import {Chain} from '../types';

type ChainTabProps = {
  chain: Chain,
  isOwner: boolean,
} & DispatchProp

class ChainTab extends React.PureComponent<ChainTabProps> {
  render () {
    const {chain, isOwner} = this.props;
    const ew = '100%', eh = '512px';
    return (
      <div>
      <div className="flexRow">
        <div className="onehalf">
          <div className="panel">
            <div className="panelHeader">{"Chain information"}</div>
            <div className="panelBody">
              <div>{"Name "}{chain.title}</div>
              {'value' in chain.owner &&
                <div>{"By team "}{chain.owner.value.name}</div>}
              {"Status "}{chain.status}
              <div>
                {"Last updated "}
                {chain.updatedAt.format('YYYY-MM-DD, hh:mm a')}
              </div>
            </div>
          </div>
         </div>
         <div className="onehalf">
          {isOwner &&
            <div className="panel">
              <div className="panelHeader">{"Restart the game"}</div>
              <div className="panelBody">
                <p>{"Starting map:"}</p>
                <RadioGroup
                  onChange={this.handleStartingMapChange}
                  selectedValue={"empty"} >
                  <Radio label="Empty" value="empty" />
                  <Radio label="From chain " value="block">
                    {"[TODO: selector for all chains]"}
                    {" "}
                    {"[TODO: selector for selected chain's round]"}
                  </Radio>
                </RadioGroup>
                <Button text="Restart game"/>
              </div>
            </div>}
        </div>
      </div>
      <div className="flexRow">
        <div className="onehalf">
          <div className="panel">
            <div className="panelHeader">{"Description of the code changes"}</div>
            <div className="panelBody" style={{flexBasis: '15em', overflow: 'auto'}}>
              {chain.description}
            </div>
          </div>
          <div className="panel">
            <div className="panelHeader">{"OCaml interface for this chain"}</div>
            <div className="panelBody" style={{padding: '0'}}>
              <AceEditor mode="ocaml" theme="github"
                value={chain.interfaceText} onChange={this.handleInterfaceTextChange}
                readOnly={false && !isOwner}
                width={ew} height={eh} />
            </div>
          </div>
        </div>
        <div className="onehalf">
          <div className="panel">
            <div className="panelHeader">{"OCaml implementation for this chain"}</div>
            <div className="panelBody" style={{width: ew, padding: '0'}}>
              <AceEditor mode="ocaml" theme="github"
              value={chain.implementationText} onChange={this.handleImplementationTextChange}
              readOnly={false && !isOwner}
              width={ew} height={'773px'} minLines={20} />
            </div>
          </div>
        </div>
      </div>
      </div>
     );
  }
  handleStartingMapChange = () => {
  };
  handleImplementationTextChange = (value: string) => {
    this.props.dispatch(actionCreators.implementationTextChanged(value));
  };
  handleInterfaceTextChange = (value: string) => {
    this.props.dispatch(actionCreators.interfaceTextChanged(value));
  };
}

export default ChainTab;
