
import * as React from 'react';
import {Button, InputGroup} from "@blueprintjs/core";

import {ChainFilters, Entity, Team} from '../types';

type ChainFiltersProps = {
  filters: ChainFilters,
  teams: Entity<Team>[] | undefined,
  onChange: (changes: object) => void,
}

class ChainFilterControls extends React.PureComponent<ChainFiltersProps> {
  render () {
    const {teams, filters} = this.props;
    const searchBtn = <Button icon="search" minimal/>;
    const {status} = filters;
    return (
      <div className="chainFilters">
        <div className="flexRow">
          <div>
            <div className="filterTitle">
              {"Filter by Status"}
            </div>
            <div className="chainStatus">
              <StatusButton label="Active" value="main" current={status} onChange={this.handleStatusChange} />
              <StatusButton label="Private test" value="private_test" current={status} onChange={this.handleStatusChange} />
              <StatusButton label="Public test" value="public_test" current={status} onChange={this.handleStatusChange} />
              <StatusButton label="Candidate" value="candidate" current={status} onChange={this.handleStatusChange} />
              <StatusButton label="Past" value="past" current={status} onChange={this.handleStatusChange} />
            </div>
          </div>
          <div>
            <div className="filterTitle">
              {"Team"}
            </div>
            <div className="bp3-select">
              <select>
                {teams && teams.map(team =>
                  <option key={team.id}>{team.isLoaded ? team.value.name : team.id}</option>)}
              </select>
            </div>
          </div>
          <div className="filterSearch">
            <InputGroup type="search" placeholder="Search" rightElement={searchBtn} />
          </div>
          <div className="filterToggle">
            <Button text="Options" rightIcon="chevron-down" />
          </div>
        </div>
      </div>
    );
  }
  handleStatusChange = (value: string, active: boolean) => {
    this.props.onChange({status: {$set: active ? value : ""}});
  };
}

type StatusButtonProps = {
  label: string,
  value: string,
  current: string,
  onChange: (value: string, active: boolean) => void,
}
class StatusButton extends React.PureComponent<StatusButtonProps> {
  render () {
    const {label, value, current} = this.props;
    return <Button text={label} onClick={this.onClick} active={value === current} />;
  }
  onClick = () => {
    const {value, current, onChange} = this.props;
    onChange(value, value !== current);
  };
}


export default ChainFilterControls;
