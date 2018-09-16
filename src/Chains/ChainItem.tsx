
import * as React from 'react';

import {Json} from '../components';
import {Chain} from '../types';

type ChainItemProps = {
  value: Chain,
  reloading: boolean,
}

class ChainItem extends React.PureComponent<ChainItemProps> {
  render () {
    const {value} = this.props;
    return (
      <div className="flexRow">
        <div>{value.title}</div>
        <div>{"TODO: chain owner team name"}</div>
        <div>{value.nb_votes_approve}</div>
        <div>{value.nb_votes_reject}</div>
        <div>{"TODO: display chain blocks"}</div>
        <Json value={value} />
      </div>
     );
  }
}

export default ChainItem;
