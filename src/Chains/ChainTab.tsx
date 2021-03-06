
import * as React from 'react';
import {Button, ControlGroup, HTMLSelect/*, Radio, RadioGroup*/} from "@blueprintjs/core";
import AceEditor from 'react-ace';
import 'brace';
import 'brace/mode/ocaml';
import 'brace/theme/github';
import 'brace/worker/javascript';

import {actionCreators, DispatchProp} from '../app';
import {Chain, ChainStatus} from '../types';

const modifiableStatuses = ["private test", "public test", "candidate"];
const statusOptions: {value: ChainStatus, label: string}[] = [
  {value: "private test", label: "private test"},
  {value: "public test", label: "public test"},
  {value: "candidate", label: "candidate"},
  /* admin only:
  {value: "main", label: "main"},
  {value: "past", label: "past"},
  {value: "invalid", label: "invalid"},
  */
];

type ChainTabProps = {
  chain: Chain,
  isOwner: boolean,
} & DispatchProp

type LocalState = {
  chainId: string | null,
  newChainName: string,
}

class ChainTab extends React.PureComponent<ChainTabProps, LocalState> {
  state = {
    chainId: null,
    newChainName: "",
  }
  render () {
    const {chain, isOwner} = this.props;
    const {newChainName} = this.state;
    const ew = '100%', eh = '512px';
    return (
      <div>
      <div className="flexRow">
        <div className="onehalf">
          <div className="panel">
            <div className="panelHeader">{"Chain information"}</div>
            <div className="panelBody">
              <div>{"Name "}{chain.title}</div>
              {chain.owner.isLoaded &&
                <div>{"By team "}{chain.owner.value.name}</div>}
              {"Status "}{chain.status}
              <div>
                {"Last updated "}
                {chain.updatedAt.format('YYYY-MM-DD, hh:mm a')}
              </div>
              <div>
                {"Game key "}
                <input type="text" className="bp3-input gameKey" value={chain.currentGameKey} readOnly onClick={this.handleGameKeyClick}/>
              </div>
            </div>
          </div>
         </div>
         <div className="onehalf">
          <div className="panel">
            <div className="panelHeader">{"Actions"}</div>
            <div className="panelBody">
              <ControlGroup fill={true}>
                <input className="bp3-input" type='text' value={newChainName} onChange={this.handleNewChainNameChange} />
                <Button icon='fork' text="Fork" onClick={this.handleForkChain} style={{maxWidth: '80px'}}/>
              </ControlGroup>
              <Button icon='trash' text="Delete" onClick={this.handleDeleteChain}
                disabled={!isOwner || chain.status !== "private test"}/>
              <Button icon='fast-backward' text="Restart" onClick={this.handleRestartGame} disabled={!isOwner} />
              {-1 !== modifiableStatuses.indexOf(chain.status) &&
                <HTMLSelect value={chain.status} onChange={this.handleStatusChange} options={statusOptions} disabled={!isOwner} />}
            </div>
          </div>
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
  handleImplementationTextChange = (value: string) => {
    this.props.dispatch(actionCreators.implementationTextChanged(value));
  };
  handleInterfaceTextChange = (value: string) => {
    this.props.dispatch(actionCreators.interfaceTextChanged(value));
  };
  handleForkChain = () => {
    this.props.dispatch(actionCreators.forkChain(this.props.chain.id, this.state.newChainName));
  };
  handleDeleteChain = () => {
    if (confirm("Are you sure you want to delete this chain?")) {
      this.props.dispatch(actionCreators.deleteChain(this.props.chain.id));
    }
  };
  handleGameKeyClick = (event: React.MouseEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  };
  handleNewChainNameChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({newChainName: event.currentTarget.value});
  };
  handleRestartGame = (event: React.MouseEvent<HTMLElement>) => {
    if (confirm("Are you sure you want to restart this chain?")) {
      this.props.dispatch(actionCreators.restartChain(this.props.chain.id));
    }
  };
  handleStatusChange = (event: React.FormEvent<HTMLSelectElement>) => {
    this.props.dispatch(actionCreators.changeChainStatus(this.props.chain.id, event.currentTarget.value as ChainStatus));
  };
  /*handleStartingMapChange = () => {
  };*/
  static getDerivedStateFromProps(props: ChainTabProps, state: LocalState) {
    const {chain} = props;
    if (chain.id !== state.chainId) {
      return {chainId: chain.id, newChainName: `fork of ${chain.title}`};
    }
    return null;
  }

}

export default ChainTab;

/*
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
              </div>
            </div>}
*/