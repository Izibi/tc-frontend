
import {Effect} from 'redux-saga';
import {call, put} from 'redux-saga/effects';

import {Actions, actionCreators, State} from '../app';

import {Rule} from '../router';
import {monitorBackendTask, loadContest, loadContestChains, loadContestTeams} from '../Backend';

import ChainsPage from './ChainsPage';

export const routes : Rule<any>[] = [
  {
    name: "ChainsPage",
    pattern: "/contests/:contestId/chains",
    reducer: (state: State, params: {contestId: string}) => ({...state, contestId: params.contestId}),
    component: ChainsPage,
    saga: chainsPageSaga,
  }
];

export function chainsReducer (state: State, action: Actions): State {
  return state;
}

function* chainsPageSaga (params: {contestId: string}) : IterableIterator<Effect> {
  yield call(monitorBackendTask, function* () {
    yield call(loadContest, params.contestId);
    const chainIds = yield call(loadContestChains, params.contestId, {/* filters go here */});
    yield call(loadContestTeams, params.contestId);
    yield put(actionCreators.chainListChanged(chainIds));
  });
}
