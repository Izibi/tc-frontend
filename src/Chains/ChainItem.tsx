
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
      <div>
        {value.title}{" "}
        <Json value={value} />
      </div>
     );
  }
}

export default ChainItem;
