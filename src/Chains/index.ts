
import {Effect} from 'redux-saga';
import {call, put, select, takeLatest, fork} from 'redux-saga/effects';

//import {spawnWorker} from '../worker';

import {Entity, Chain, Block} from '../types';
import {Actions, State, actionCreators, ActionTypes, ActionsOfType, Saga} from '../app';
import {Rule, navigate} from '../router';
import {monitorBackendTask, loadContestTeam, loadContestChains, loadGameHead, forkChain, deleteChain, loadBlock} from '../Backend';
import {selectors} from '../Backend';

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
      if (-1 === chainIds.indexOf(chainId) && chainIds.length > 0) {
        chainId = chainIds[0];
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
  }
  return state;
}

function* chainsPageSaga (params: Params) : Saga {
  yield fork(chainListSaga, params);
  yield takeLatest(ActionTypes.FORK_CHAIN,
    function* (action: ActionsOfType<typeof ActionTypes.FORK_CHAIN>) : Saga {
      yield call(monitorBackendTask, function* () {
        const chainId: string = yield call(forkChain, action.payload.chainId);
        yield call(navigate, "ChainPage", {contestId: params.contestId, chainId});
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
  yield call(monitorBackendTask, function* () {
    const {teamId} = yield call(loadContestTeam, params.contestId);
    yield put(actionCreators.teamChanged(teamId));
    const {chainIds} = yield call(loadContestChains, params.contestId, {});
    yield put(actionCreators.chainListChanged(chainIds));
    /* yield call(loadContestTeams, params.contestId); */
    /* TODO: if params.blockHash is undefined, find the hash of the last block
             in the selected chain, and put it in the store. */
  });
}

function* blockPageSaga (params: Params) : IterableIterator<Effect> {
  if (!params.blockHash) {
    yield call(navigate, "ChainsPage", {contestId: params.contestId, chainId: params.chainId});
    return;
  }
  yield fork(chainListSaga, params);
  yield call(monitorBackendTask, function* () {
    if (params.blockHash) {
      /* Ensure the block is loaded. */
      let maybeBlock: Block | undefined;
      yield select((state: State) => {
        maybeBlock = state.blocks.get(params.blockHash as string);
      });
      if (!maybeBlock) {
        const block = yield call(loadBlock, params.blockHash);
        yield put(actionCreators.blockLoaded(params.blockHash, block));
      }
    }
    // const {round, nb_players} = state;
    // - need a creation timestamp
    // - computer per-player nb. commands, nb. changes, score
    const {teamId} = yield call(loadContestTeam, params.contestId);
    yield put(actionCreators.teamChanged(teamId));
    const {chainIds} = yield call(loadContestChains, params.contestId, {});
    yield put(actionCreators.chainListChanged(chainIds));
  });
}

function* chainListSaga (params: Params) : Saga {
  yield takeLatest(ActionTypes.CHAIN_LIST_SCROLLED,
    function* (action: ActionsOfType<typeof ActionTypes.CHAIN_LIST_SCROLLED>) : Saga {
      const {first, last} = action.payload;
      const chains: Entity<Chain>[] = yield select((state : State) =>
        state.chainIds.slice(first, last + 1).map(id => selectors.getChain(state, id)));
      /* TODO: update subscriptions to the visible games */
      const channels = [`contest:${params.contestId}`];
      for (let chain of chains) {
        if (chain.isLoaded && chain.value.currentGameKey !== "") {
          channels.push(`game:${chain.value.currentGameKey}`)
        }
      }
      yield put(actionCreators.eventSourceSubsChanged(channels));
      // XXX if a chain was visible before being loaded, its game will not be loaded
      for (let chain of chains) {
        if (chain.isLoaded) {
          const gameKey = chain.value.currentGameKey;
          if (gameKey !== "") {
            try {
              const {game, blocks} = yield call(loadGameHead, gameKey);
              yield put(actionCreators.gameLoaded(gameKey, game, blocks));
              // console.log('chain', chain.id, chain.value.currentGameKey, game, page, blocks);
            } catch (ex) {
              console.log("failed to load game?", gameKey);
            }
          }
        }
      }
    }
  );
  yield takeLatest(ActionTypes.CHAIN_CREATED, function*(): Saga {
    const {chainIds} = yield call(loadContestChains, params.contestId, {});
    yield put(actionCreators.chainListChanged(chainIds));
  });
  yield takeLatest(ActionTypes.CHAIN_DELETED, function*(action: ActionsOfType<typeof ActionTypes.CHAIN_DELETED>): Saga {
    const {chainIds} = yield call(loadContestChains, params.contestId, {});
    yield put(actionCreators.chainListChanged(chainIds));
    if (params.chainId == action.payload.chainId) {
      yield call(navigate, "ChainsPage", {contestId: params.contestId});
    }
  });
}
