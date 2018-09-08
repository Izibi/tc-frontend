
import {Effect} from 'redux-saga';
import {call, select} from 'redux-saga/effects';

import {State, Actions} from '../app';
import {Rule} from '../router';
import {monitorBackendTask, loadTeam} from '../Backend';
import {User}  from '../types';

import {TeamManagementParams} from './types';
import TeamManagementPage from './TeamManagement';

export {TeamState} from './types';

export function teamReducer (state: State, action: Actions): State {
  return state;
}

function* teamManagementSaga (params: TeamManagementParams) : IterableIterator<Effect> {
  yield call(monitorBackendTask, function* () {
    const user: User | undefined = yield select((state: State) => state.user);
    if (!user) throw new Error("user not authenticated");
    yield call(loadTeam, user.id, params.contestId);
  });
}

export const routes : Rule[] = [
  {
    name: "TeamManagement",
    pattern: "/contests/:contestId/team",
    component: TeamManagementPage,
    saga: teamManagementSaga
  },
];
