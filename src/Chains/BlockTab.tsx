
import * as React from 'react';

import {BlockData, Game, Player, PlayerRanking} from '../types';

type BlockTabProps = {
  data: BlockData,
  game: Game | null,
}

class BlockTab extends React.PureComponent<BlockTabProps> {
  render () {
    const {data: {hash, block, scores}, game} = this.props;
    if (!block || !(block.type === 'setup' || block.type === 'command')) {
      return null;
    }
    const viewUrl = `${process.env.BLOCKSTORE_URL}/${block.task}/view.html?h=${hash}`;
    return (
      <div className="flexRow">
        <iframe style={{width: '400px', height: '400px', 'border': '0'}} src={viewUrl} />
        <div style={{margin: '0 10px', flex: '1 1 auto'}}>
          <div className="panel">
            <div className="panelHeader">{"Block ranking"}</div>
            <div className="panelBody">
              {game && game.players &&
                <table>
                  <thead>
                    <tr>
                      <th>{"player"}</th>
                      <th>{"team"}</th>
                      <th>{"bot id"}</th>
                      <th>{"score"}</th>
                      <th>{"rank"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {game.players.map((player, i) => <PlayerRow key={player.rank} player={player} nbPlayers={game.nbPlayers}
                      ranking={scores && scores.rankings[i]} />)}
                  </tbody>
                </table>}
            </div>
          </div>
        </div>
      </div>
     );
  }
}

type PlayerRowProps = {
  nbPlayers: number,
  player: Player,
  ranking: PlayerRanking | undefined,
}
function PlayerRow({player, nbPlayers, ranking}: PlayerRowProps) {
  const hue = Math.floor(360 * player.rank / nbPlayers);
  const bgColor = `hsl(${hue}, 100%, 40%)`;
  return (
    <tr>
      <td className='num'>
        <div className='playerColor' style={{backgroundColor: bgColor}}>{player.rank}</div></td>
      <td title={player.team.id}>
        {player.team.isLoaded && player.team.value.name}
      </td>
      <td className='num'>{player.botId}</td>
      {ranking && <td className='num'>{ranking.score}</td>}
      {ranking && <td className='num'>{ranking.rank}</td>}
    </tr>
  );
}

export default BlockTab;
