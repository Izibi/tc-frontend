
import {Effect} from 'redux-saga';
import {call} from 'redux-saga/effects';

import {Actions, State} from '../app';

import {Rule} from '../router';
import {monitorBackendTask, loadContest} from '../Backend';

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
    // TODO: load chains
  });
}
