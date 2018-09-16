
import * as React from 'react';
import {Button, InputGroup} from "@blueprintjs/core";

import {Team} from '../types';

type ChainFiltersProps = {
  teams: Team[],
}

class ChainFilters extends React.PureComponent<ChainFiltersProps> {
  render () {
    const {teams} = this.props;
    const searchBtn = <Button icon="search" minimal/>;
    return (
      <div className="chainFilters">
        <div className="flexRow">
          <div>
            <div className="filterTitle">
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
            <div className="filterTitle">
              {"Team"}
            </div>
            <div className="bp3-select">
              <select>
                {teams.map(team =>
                  <option key={team.id}>{team.name}</option>)}
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
}

export default ChainFilters;
