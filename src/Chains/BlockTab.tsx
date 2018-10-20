
import * as React from 'react';

import {Block} from '../types';

type BlockTabProps = {
  block: Block | undefined
}

class BlockTab extends React.PureComponent<BlockTabProps> {
  render () {
    const {block} = this.props;

    if (!block || !(block.type === 'setup' || block.type === 'command')) {
      return null;
    }
    const viewUrl = `${process.env.BLOCKSTORE_URL}/${block.task}/view.html?h=${block.hash}`;
    return (
      <div>
        <iframe style={{width: '400px', height: '400px', 'border': '0'}} src={viewUrl} />
      </div>
     );
  }
}

export default BlockTab;
