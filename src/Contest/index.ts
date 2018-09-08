
import {Actions, ActionTypes, State} from '../app';

export {default as Header} from './Header';
export {ContestState} from './types';

export function contestReducer (state: State, action: Actions): State {
  switch (action.type) {
    case ActionTypes.CONTEST_LOADED: {
      const {contest, contestPeriod} = action.payload;
      /* Clear task and task_resources if the task changes. */
      let task = state.task;
      let task_resources = state.task_resources;
      if (task && task.id !== contest.task_id) {
        task = undefined;
        task_resources = undefined;
      }
      return {...state, contest, contestPeriod, task, task_resources};
    }
  }
  return state;
}
