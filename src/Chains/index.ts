
import {Effect} from 'redux-saga';
import {call, put} from 'redux-saga/effects';

import {Actions, actionCreators, State} from '../app';

import {Rule} from '../router';
import {monitorBackendTask, loadContest, loadContestChains, loadContestTeams} from '../Backend';

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
  return state;
}

function* chainsPageSaga (params: Params) : IterableIterator<Effect> {
  yield call(monitorBackendTask, function* () {
    yield call(loadContest, params.contestId);
    yield call(loadContestTeams, params.contestId);
    const chainIds = yield call(loadContestChains, params.contestId, {/* filters go here */});
    yield put(actionCreators.chainListChanged(chainIds));
    /* TODO: if params.chainId is undefined, find the id of the main chain (it
             should always be included in the server's response), and put it in
             the store. */
    /* TODO: if params.blockHash is undefined, find the hash of the last block
             in the selected chain, and put it in the store. */
  });
}
