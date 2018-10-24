
import * as React from 'react';

import {Block, Player} from '../types';

type BlockTabProps = {
  block: Block | undefined,
  players: Player[] | undefined,
  nbPlayers: number | undefined,
}

class BlockTab extends React.PureComponent<BlockTabProps> {
  render () {
    const {block, players, nbPlayers} = this.props;
    if (!block || !(block.type === 'setup' || block.type === 'command')) {
      return null;
    }
    const viewUrl = `${process.env.BLOCKSTORE_URL}/${block.task}/view.html?h=${block.hash}`;
    return (
      <div style={{display: 'flex'}}>
        <iframe style={{width: '400px', height: '400px', 'border': '0'}} src={viewUrl} />
        <div>
          {players !== undefined && nbPlayers !== undefined &&
            <table>
              <thead>
                <tr>
                  <th>{"player"}</th>
                  <th>{"team"}</th>
                  <th>{"bot id"}</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => <PlayerRow player={player} nbPlayers={nbPlayers}/>)}
              </tbody>
            </table>}
        </div>
      </div>
     );
  }
}

function PlayerRow({player, nbPlayers}: {player: Player, nbPlayers: number}) {
  const hue = Math.floor(360 * player.rank / nbPlayers);
  const bgColor = `hsl(${hue}, 100%, 40%)`;
  return (
    <tr key={player.rank}>
      <td className='num' style={{backgroundColor: bgColor}}>{player.rank}</td>
      <td title={player.team.id}>
        {player.team.isLoaded && player.team.value.name}
      </td>
      <td className='num'>{player.botId}</td>
    </tr>
  );
}

export default BlockTab;
