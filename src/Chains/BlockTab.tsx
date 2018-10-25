
import * as React from 'react';

import {BlockData, Game, Player, PlayerRanking} from '../types';

type BlockTabProps = {
  data: BlockData,
  game: Game | null,
}
type BlockTabState = {
  task: string,
  block: string,
}

class BlockTab extends React.PureComponent<BlockTabProps, BlockTabState> {
  state = {task: "", block: ""};
  render () {
    const {data: {scores}, game} = this.props;
    const {task, block} = this.state;
    const viewerUrl = `${process.env.BLOCKSTORE_URL}/${task}/view.html#h=${block}`;
    return (
      <div className="flexRow">
        <iframe style={{width: '400px', height: '400px', 'border': '0'}} src={viewerUrl} />
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
  static getDerivedStateFromProps(props: BlockTabProps, state: BlockTabState) {
    /* Latch on to the most recent task and block hashes, to avoid unnecessary
       unloading of the viewer's iframe. */
    const {hash, block} = props.data;
    if (block && 'task' in block && block.task !== state.task) {
      return {task: block.task, block: hash};
    }
    /* Viewers must be prepared to receive a hash for a block from a different
       game (viewer for game A is displayed, user clicks on block b for game B
       that we haven't loaded yet, viewer URL will be task A / block b). */
    if (hash !== state.block) {
      return {block: hash};
    }
    return null;
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
