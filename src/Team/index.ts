
import {Effect} from 'redux-saga';
import {call, put, select} from 'redux-saga/effects';

import {State, Actions, ActionTypes, actionCreators} from '../app';
import {Rule} from '../router';
import {monitorBackendTask, loadTeam} from '../Backend';

import {TeamManagementParams} from './types';
import TeamManagementPage from './TeamManagement';

export {TeamState} from './types';

export function teamReducer (state: State, action: Actions): State {
  switch (action.type) {
    case ActionTypes.TEAM_CHANGED: {
      const {teamId} = action.payload;
      state = {...state, teamId};
      break;
    }
    case ActionTypes.LEAVE_TEAM: {
      state = {...state, teamId: 'unknown'};
      break;
    }
    case ActionTypes.CHANGE_TEAM_ACCESS_CODE: {
      // XXX backend optimistic update
      break;
    }
    case ActionTypes.CHANGE_TEAM_OPEN: {
      // XXX backend optimistic update
      break;
    }
  }
  return state;
}

function* teamManagementSaga (params: TeamManagementParams) : IterableIterator<Effect> {
  yield call(monitorBackendTask, function* () {
    const userId = yield select((state: State) => state.userId);
    const teamId = yield call(loadTeam, userId, params.contestId);
    yield put(actionCreators.teamChanged(teamId));
  });
}

const TeamManagementRoute : Rule<TeamManagementParams> = {
  name: "TeamManagement",
  pattern: "/contests/:contestId/team",
  reducer: (state: State, params: TeamManagementParams) => ({...state, contestId: params.contestId}),
  component: TeamManagementPage,
  saga: teamManagementSaga
};

export const routes = [
  TeamManagementRoute
];
