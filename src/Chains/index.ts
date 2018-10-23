
import {Effect} from 'redux-saga';
import {call, put, select, takeLatest, fork} from 'redux-saga/effects';
import update from 'immutability-helper';

//import {spawnWorker} from '../worker';

import {Entity, Chain, Block} from '../types';
import {Actions, State, actionCreators, ActionTypes, ActionsOfType, Saga} from '../app';
import {Rule, navigate} from '../router';
import {
  monitorBackendTask, selectors, loadContestTeam, loadContest, loadContestChains,
  loadChain, loadGameHead, forkChain, deleteChain, restartChain, loadBlock} from '../Backend';

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
        blockHash: params.blockHash
      }),
    component: ChainsPage,
    saga: blockPageSaga,
  },

];

export function chainsReducer (state: State, action: Actions): State {
  switch (action.type) {
    case ActionTypes.CHAIN_LIST_CHANGED: {
      let {chainIds} = action.payload;
      let chainId = state.chainId;
      if (chainId === 'unknown' || selectors.getChain(state, chainId).isNull) {
        if (-1 === chainIds.indexOf(chainId) && chainIds.length > 0) {
          chainId = chainIds[0];
        }
      }
      return {...state, chainIds, chainId};
    }
    case ActionTypes.CHAIN_LIST_SCROLLED: {
      const {first, last} = action.payload;
      state = {...state, chainList: {firstVisible: first, lastVisible: last}};
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
    case ActionTypes.BLOCK_LOADED: {
      const {hash, block} = action.payload;
      state = {...state, blocks: state.blocks.set(hash, block)};
      break;
    }
    case ActionTypes.CHAIN_FILTERS_CHANGED: {
      const {changes} = action.payload;
      state = update(state, {chainFilters: changes});
      break;
    }
  }
  return state;
}

function* chainsPageSaga (params: Params) : Saga {
  /* Fork the chain list saga to catch the first 'chain list scrolled' event
     and load the games that are visible. */
  yield fork(chainListSaga, params);
  yield call(monitorBackendTask, function* () {
    if (params.chainId) {
      /* Load chain details in parallel with chain list & blocks.*/
      yield fork(loadChain, params.chainId)
    }
    yield call(commonStartupSaga, params.contestId);
  });
  yield takeLatest(ActionTypes.FORK_CHAIN,
    function* (action: ActionsOfType<typeof ActionTypes.FORK_CHAIN>) : Saga {
      yield call(monitorBackendTask, function* () {
        const {chainId, title} = action.payload;
        const newChainId: string = yield call(forkChain, chainId, title);
        yield call(navigate, "ChainPage", {contestId: params.contestId, chainId: newChainId});
      });
    }
  );
  yield takeLatest(ActionTypes.DELETE_CHAIN,
    function* (action: ActionsOfType<typeof ActionTypes.DELETE_CHAIN>) : Saga {
      yield call(monitorBackendTask, function* () {
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
    function* (action: ActionsOfType<typeof ActionTypes.FORK_CHAIN>) : Saga {
      yield call(monitorBackendTask, function* () {
        const chainId = action.payload.chainId;
        yield call(restartChain, chainId);
        const chain = yield select((state: State) => selectors.getChain(state, chainId));
        yield call(loadChainGame, chain);
      });
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
    yield call(commonStartupSaga, params.contestId);
    if (!params.chainId) return;
    let chainId: string = params.chainId;
    if (params.blockHash) {
      let blockHash : string = params.blockHash;
      if (blockHash === 'last') {
        // console.log('Looking for last block on chain', chainId);
        let chain: Entity<Chain>;
        chain = yield select((state: State) => selectors.getChain(state, chainId));
        if (!chain.isLoaded) {
          // TODO: load the specific chain requested?
          console.log('Chain is not loaded, bailing out.');
          return;
        }
        if (!chain.value.game) {
          console.log('Chain found, but the game is not loaded.  Bailing out.');
          // do we need to load it?
          return;
        }
        blockHash = chain.value.game.lastBlock;
        // console.log('The last block hash is', blockHash);
      }
      /* Ensure the block is loaded. */
      let maybeBlock: Block | undefined;
      yield select((state: State) => {
        maybeBlock = state.blocks.get(blockHash as string);
      });
      if (!maybeBlock) {
        const block = yield call(loadBlock, blockHash);
        yield put(actionCreators.blockLoaded(blockHash, block));
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
  yield takeLatest(ActionTypes.CHAIN_LIST_SCROLLED, function* (action: ActionsOfType<typeof ActionTypes.CHAIN_LIST_SCROLLED>) : Saga {
    const chains: Entity<Chain>[] = yield select(getVisibleChains);
    /* Update subscriptions to the visible games. */
    const channels = [`contest:${params.contestId}`];
    for (let chain of chains) {
      if (chain.isLoaded && chain.value.currentGameKey !== "") {
        channels.push(`game:${chain.value.currentGameKey}`)
      }
    }
    yield put(actionCreators.eventSourceSubsChanged(channels));
    /* Load the games on the visible chains. */
    yield call(loadChainGames, chains);
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
  const filters = yield select((state: State) => state.chainFilters);
  const {chainIds} = yield call(loadContestChains, contestId, filters);
  yield put(actionCreators.chainListChanged(chainIds));
  const {chainId, isLoaded} : {chainId: string | null, isLoaded: boolean}
    = yield select((state: State) => {
      const {chainId} = state;
      const {isLoaded} = selectors.getChain(state, state.chainId);
      return {chainId, isLoaded};
    });
  if (!isLoaded && chainId !== null) {
    yield fork(loadChain, chainId);
  }
  const chains: Entity<Chain>[] = yield select(getVisibleChains);
  yield call(loadChainGames, chains);
}

function* loadChainGames(chains: Entity<Chain>[]): Saga {
  for (let chain of chains) {
    yield call(loadChainGame, chain);
  }
}

function* loadChainGame(chain: Entity<Chain>): Saga {
  if (chain.isLoaded) {
    const gameKey = chain.value.currentGameKey;
    if (gameKey !== "") {
      try {
        const {game, blocks} = yield call(loadGameHead, gameKey);
        yield put(actionCreators.gameLoaded(gameKey, game, blocks));
        // TODO: load more pages if needed
      } catch (ex) {
        console.log("failed to load game?", gameKey);
      }
    }
  }
}

function getVisibleChains (state : State): Entity<Chain>[] {
  const {firstVisible, lastVisible} = state.chainList;
  const chainIds = state.chainIds.slice(firstVisible, lastVisible + 1);
  return chainIds.map(id => selectors.getChain(state, id));
}
