
import {Effect} from 'redux-saga';
import {call, put, select, takeLatest, fork} from 'redux-saga/effects';
import update from 'immutability-helper';

//import {spawnWorker} from '../worker';

import {Entity, Chain, ChainFilters, BlockData, Block, ScoreBoard} from '../types';
import {GameHead} from '../Backend/types';
import {Actions, State, actionCreators, ActionTypes, ActionsOfType, Saga} from '../app';
import {Rule, navigate} from '../router';
import {difference} from '../utils';
import {
  monitorBackendTask, selectors, optimisticChange,
  loadContestTeam, loadContest, loadContestChains, loadChain,
  loadGameHead, loadGamePage,
  forkChain, deleteChain, restartChain, updateChain,
  loadBlock, loadBlockScores
} from '../Backend';
import {getChainStatusId} from '../Backend/selectors';

import ChainsPage from './ChainsPage';

type ChainsPageParams = {
  contestId: string,
  chainId?: string /* main chain of contest's current game if unspecified */,
  blockHash?: string /* last block of selected chain if unspecified */,
}
type ChainPageParams = {
  contestId: string,
  chainId: string,
}
type BlockPageParams = {
  contestId: string,
  chainId: string,
  blockHash: string,
}
type Params = {
  contestId: string,
  chainId?: string,
  blockHash?: string,
}

export const routes : Rule<any>[] = [
  {
    name: "ChainsPage",
    pattern: "/contests/:contestId/chains",
    reducer: (state: State, params: ChainsPageParams) => (
      {...state, contestId: params.contestId}),
    component: ChainsPage,
    saga: chainsPageSaga,
  },
  {
    name: "ChainPage",
    pattern: "/contests/:contestId/chains/:chainId",
    reducer: (state: State, params: ChainPageParams) => (
      {...state, contestId: params.contestId, chainId: params.chainId}),
    component: ChainsPage,
    saga: chainsPageSaga,
  },
  {
    name: "BlockPage",
    pattern: "/contests/:contestId/chains/:chainId/blocks/:blockHash",
    reducer: (state: State, params: BlockPageParams) => (
      {...state,
        contestId: params.contestId,
        chainId: params.chainId,
        blockHash: params.blockHash,
        players: [], // HACK
      }),
    component: ChainsPage,
    saga: blockPageSaga,
  },

];

export function chainsReducer (state: State, action: Actions): State {
  switch (action.type) {
    case ActionTypes.CHAIN_LIST_CHANGED: {
      let {chainIds} = action.payload;
      state = {...state, chainIds}
      state.chainId = getVisibleChainId(state);
      return state;
    }
    case ActionTypes.CHAIN_LIST_SCROLLED: {
      const {first, last} = action.payload;
      state = update(state, {chainList: {
        firstVisible: {$set: first},
        lastVisible: {$set: last},
      }});
      break;
    }
    case ActionTypes.CHAIN_LIST_UPDATE_DONE: {
      const {chainIds} = action.payload;
      state = update(state, {chainList: {
        visibleIds: {$set: chainIds},
      }});
      break;
    }
    case ActionTypes.DELETE_CHAIN: {
      const chainIds = state.chainIds.slice();
      const i = chainIds.indexOf(action.payload.chainId);
      if (i !== -1) {
        chainIds.splice(i, 1);
        state = {...state, chainIds};
      }
      break;
    }
    case ActionTypes.CHAIN_FILTERS_CHANGED: {
      const {changes} = action.payload;
      state = update(state, {chainFilters: changes});
      break;
    }
    case ActionTypes.INTERFACE_TEXT_CHANGED: {
      // TODO: save action.payload.text in store + set unsaved protocol flag
      break
    }
  }
  return state;
}

function* chainsPageSaga (params: Params): Saga {
  /* Fork the chain list saga to catch the first 'chain list scrolled' event
     and load the games that are visible. */
  yield fork(chainListSaga, params);
  yield call(monitorBackendTask, function* (): Saga {
    yield call(commonStartupSaga, params.contestId, params.chainId);
    if (params.chainId) {
      yield fork(loadChain, params.chainId);
    }
  });
  yield takeLatest(ActionTypes.FORK_CHAIN,
    function* (action: ActionsOfType<typeof ActionTypes.FORK_CHAIN>): Saga {
      yield call(monitorBackendTask, function* (): Saga {
        const {chainId, title} = action.payload;
        const newChainId: string = yield call(forkChain, chainId, title);
        yield call(navigate, "ChainPage", {contestId: params.contestId, chainId: newChainId});
      });
    }
  );
  yield takeLatest(ActionTypes.DELETE_CHAIN,
    function* (action: ActionsOfType<typeof ActionTypes.DELETE_CHAIN>): Saga {
      yield call(monitorBackendTask, function* (): Saga {
        /* The action's reducer eagerly removed the id from the list. */
        yield call(deleteChain, action.payload.chainId);
        /* An event posted to the team's channel will reload the chain list. */
        /* The chain being deleted was (probably) the current chain, so clear
           the selection by navigating to the list of chains. */
        yield call(navigate, "ChainsPage", {contestId: params.contestId});
      });
    }
  );
  yield takeLatest(ActionTypes.RESTART_CHAIN,
    function* (action: ActionsOfType<typeof ActionTypes.FORK_CHAIN>): Saga {
      yield call(monitorBackendTask, function* (): Saga {
        const chainId = action.payload.chainId;
        yield call(restartChain, chainId);
        const chain = yield select(getChain, chainId);
        yield call(loadChainGame, chain);
      });
    }
  );
  yield takeLatest(ActionTypes.CHANGE_CHAIN_STATUS,
    function* (action: ActionsOfType<typeof ActionTypes.CHANGE_CHAIN_STATUS>): Saga {
      const {chainId, status} = action.payload;
      const statusId = getChainStatusId(status);
      yield call(monitorBackendTask, function* (): Saga {
        yield call(updateChain, chainId, {statusId});
      }, [optimisticChange('chains', chainId, {statusId})]);
    }
  );
}

function* blockPageSaga (params: Params) : IterableIterator<Effect> {
  if (!params.blockHash) {
    yield call(navigate, "ChainsPage", {contestId: params.contestId, chainId: params.chainId});
    return;
  }
  /* Fork the chain list saga to catch the first 'chain list scrolled' event
     and load the games that are visible. */
  yield fork(chainListSaga, params);
  yield call(monitorBackendTask, function* () {
    yield fork(commonStartupSaga, params.contestId, params.chainId);
    if (!params.chainId) return;
    let chainId: string = params.chainId;
    let chain: Entity<Chain> = yield select(getChain, chainId);;
    if (!chain.isLoaded) {
      yield call(loadChain, params.chainId);
      chain = yield select(getChain, chainId);
    }
    if (chain.isLoaded && !chain.value.game) {
      yield call(loadChainGame, chain);
      chain = yield select(getChain, chainId);
    }
    if (params.blockHash) {
      let blockHash : string = params.blockHash;
      if (blockHash === 'last') {
        // console.log('Looking for last block on chain', chainId);
        if (!chain.isLoaded) {
          console.log('Chain failed to load, bailing out.');
          return;
        }
        if (!chain.value.game) {
          console.log('Game is not loaded, bailing out.');
          return;
        }
        blockHash = chain.value.game.lastBlock;
        // console.log('The last block hash is', blockHash);
      }
      /* Ensure the block is loaded. */
      const blockData: BlockData = yield select(selectors.getBlockData, blockHash);
      if (!blockData.block) {
        const block: Block = yield call(loadBlock, blockHash);
        yield put(actionCreators.blockLoaded(blockHash, block));
      }
      if (!blockData.scores) {
        const scores: ScoreBoard = yield call(loadBlockScores, blockHash);
        yield put(actionCreators.blockScoresLoaded(blockHash, scores));
      }
      // const {round, nb_players} = state;
      // - need a creation timestamp
      // - computer per-player nb. commands, nb. changes, score
    }
  });
}

function* chainListSaga (params: Params) : Saga {
  yield takeLatest(ActionTypes.CHAIN_FILTERS_CHANGED, function*() {
    yield call(monitorBackendTask, function* () {
      yield call(refreshChainList, params.contestId);
    });
  });
  yield takeLatest(ActionTypes.CHAIN_LIST_SCROLLED, function* () : Saga {
    yield call(updateSubscriptions);
  });
  yield takeLatest(ActionTypes.CHAIN_CREATED, function*(): Saga {
    yield call(refreshChainList, params.contestId);
  });
  yield takeLatest(ActionTypes.CHAIN_DELETED, function*(action: ActionsOfType<typeof ActionTypes.CHAIN_DELETED>): Saga {
    yield call(refreshChainList, params.contestId);
    if (params.chainId == action.payload.chainId) {
      yield call(navigate, "ChainsPage", {contestId: params.contestId});
    }
  });
  yield call(updateSubscriptions);
  function* updateSubscriptions() {
    const {visibleChains, visibleIds, newChains, selectedChain}: {visibleChains: Entity<Chain>[], visibleIds: string[], newChains: Entity<Chain>[], selectedChain: Entity<Chain>} =
      yield select((state: State) => {
        const {firstVisible, lastVisible, visibleIds: oldIds} = state.chainList;
        const visibleIds = state.chainIds.slice(firstVisible, lastVisible + 1);
        const newIds = difference(visibleIds, oldIds);
        const visibleChains = visibleIds.map(id => selectors.getChain(state, id));
        const newChains = newIds.map(id => selectors.getChain(state, id));
        const selectedChain = selectors.getChain(state, params.chainId || null);
        return {visibleChains, visibleIds, newChains, selectedChain};
      });
    /* Update subscriptions to the visible games plus the selected chain. */
    const channels = [`contest:${params.contestId}`];
    function addChainGameKey(chain: Entity<Chain>) {
      if (chain.isLoaded && chain.value.currentGameKey !== "") {
        channels.push(`game:${chain.value.currentGameKey}`)
      }
    }
    for (let chain of visibleChains) {
      visibleIds.push(chain.id);
      addChainGameKey(chain);
    }
    addChainGameKey(selectedChain);
    yield put(actionCreators.eventSourceSubsChanged(channels));
    /* Load the games on the newly visible chains. */
    yield call(loadChainGames, newChains);
    yield put(actionCreators.chainListUpdateDone(visibleIds));
  }
}

function* commonStartupSaga(contestId: string): Saga {
  if (!(yield select(isContestLoaded))) {
    // Load the contest and list of teams.
    yield call(loadContest, contestId);
  }
  if (!(yield select(isTeamLoaded))) {
    // Load our team and members.
    const {teamId} = yield call(loadContestTeam, contestId);
    yield put(actionCreators.teamChanged(teamId));
  }
  yield call(refreshChainList, contestId);
  function isContestLoaded (state: State) {
    return selectors.getContest(state, contestId).isLoaded;
  }
  function isTeamLoaded (state: State) {
    return selectors.getTeam(state, state.teamId).isLoaded;
  }
}

function* refreshChainList(contestId: string): Saga {
  const filters: ChainFilters = yield select((state: State) => state.chainFilters);
  const {chainIds}: {chainIds: string[]} = yield call(loadContestChains, contestId, filters);
  yield put(actionCreators.chainListChanged(chainIds));
  const {chainId, isLoaded} : {chainId: string | null, isLoaded: boolean}
    = yield select((state: State) => {
      const chainId = getVisibleChainId(state);
      const {isLoaded} = selectors.getChain(state, state.chainId);
      return {chainId, isLoaded};
    });
  if (!isLoaded && chainId !== null) {
    yield fork(loadChain, chainId);
  }
  const chains: Entity<Chain>[] = yield select(getVisibleChains);
  yield call(loadChainGamesIfNeeded, chains);
}

function* loadChainGames(chains: Entity<Chain>[]): Saga {
  for (let chain of chains) {
    yield call(loadChainGame, chain);
  }
}

function* loadChainGamesIfNeeded(chains: Entity<Chain>[]): Saga {
  for (let chain of chains) {
    if (chain.isLoaded && chain.value.game === null) {
      yield call(loadChainGame, chain);
    }
  }
}

function* loadChainGame(chain: Entity<Chain>): Saga {
  if (chain.isLoaded) {
    const gameKey = chain.value.currentGameKey;
    if (gameKey !== "") {
      try {
        const {game, blocks, players, scores, page}: GameHead = yield call(loadGameHead, gameKey);
        yield put(actionCreators.gameLoaded(gameKey, game, blocks, players, scores));
        if (page > 0) {
          yield call(loadGamePage, gameKey, page - 1);
        }
      } catch (ex) {
        console.log("failed to load game?", gameKey);
      }
    }
  }
}

function getVisibleChainId(state: State): string {
  let chainId = state.chainId;
  if (chainId === 'unknown' || selectors.getChain(state, chainId).isNull) {
    const chainIds = state.chainIds;
    if (-1 === chainIds.indexOf(chainId) && chainIds.length > 0) {
      chainId = chainIds[0];
    }
  }
  return chainId;
}

function getVisibleChains (state: State): Entity<Chain>[] {
  const {firstVisible, lastVisible} = state.chainList;
  const chainIds = state.chainIds.slice(firstVisible, lastVisible + 1);
  return chainIds.map(id => selectors.getChain(state, id));
}

function getChain(state: State, chainId: string): Entity<Chain> {
  return selectors.getChain(state, chainId);
}
