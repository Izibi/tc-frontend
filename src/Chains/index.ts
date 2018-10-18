
import {Effect} from 'redux-saga';
import {call, put, select, takeLatest} from 'redux-saga/effects';

import {Entity, Chain} from '../types';
import {Actions, State, actionCreators, ActionTypes, ActionsOfType, Saga} from '../app';
import {Rule} from '../router';
import {monitorBackendTask, loadContestChains, loadGameHead, forkChain, deleteChain} from '../Backend';
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
    saga: chainsPageSaga,
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
    }
  }
  return state;
}

function* chainsPageSaga (params: Params) : IterableIterator<Effect> {
  yield takeLatest(ActionTypes.CHAIN_LIST_SCROLLED,
    function* (action: ActionsOfType<typeof ActionTypes.CHAIN_LIST_SCROLLED>) : Saga {
      const {first, last} = action.payload;
      const chains: Entity<Chain>[] = yield select((state : State) =>
        state.chainIds.slice(first, last + 1).map(id => selectors.getChain(state, id)));
      /* TODO: update subscriptions to the visible games */
      const channels = [];
      for (let chain of chains) {
        if (chain.isLoaded && chain.value.currentGameKey !== "") {
          channels.push(`games/${chain.value.currentGameKey}`)
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
  yield takeLatest(ActionTypes.FORK_CHAIN,
    function* (action: ActionsOfType<typeof ActionTypes.FORK_CHAIN>) : Saga {
      yield call(monitorBackendTask, function* () {
        yield call(forkChain, action.payload.chainId);
      });
    }
  );
  yield takeLatest(ActionTypes.DELETE_CHAIN,
    function* (action: ActionsOfType<typeof ActionTypes.DELETE_CHAIN>) : Saga {
      yield call(monitorBackendTask, function* () {
        /* The action's reducer eagerly removed the id from the list. */
        yield call(deleteChain, action.payload.chainId);
        /* An event posted to the team's channel will reload the chain list. */
      });
    }
  );
  yield call(monitorBackendTask, function* () {
    const {chainIds} = yield call(loadContestChains, params.contestId, {});
    yield put(actionCreators.chainListChanged(chainIds));
    /* yield call(loadContestTeams, params.contestId); */
    /* TODO: if params.chainId is undefined, find the id of the main chain (it
             should always be included in the server's response), and put it in
             the store. */
    /* TODO: if params.blockHash is undefined, find the hash of the last block
             in the selected chain, and put it in the store. */
  });
}
