
import {Effect} from 'redux-saga';
import {call, select} from 'redux-saga/effects';

import {State, Actions, ActionTypes} from '../app';
import {Rule} from '../router';
import {monitorBackendTask, loadTeam} from '../Backend';
import {User}  from '../types';

import {TeamManagementParams} from './types';
import TeamManagementPage from './TeamManagement';

export {TeamState} from './types';

export function teamReducer (state: State, action: Actions): State {
  switch (action.type) {
    case ActionTypes.LEAVE_TEAM: {
      state = {...state, team: undefined};
      break;
    }
    case ActionTypes.CHANGE_TEAM_ACCESS_CODE: {
      if (typeof state.team === 'object') {
        state = {...state, team: {...state.team, access_code: "..."}};
      }
      break;
    }
    case ActionTypes.CHANGE_TEAM_OPEN: {
      if (typeof state.team === 'object') {
        state = {...state, team: {...state.team, is_open: action.payload.isOpen}};
      }
      break;
    }
  }
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
