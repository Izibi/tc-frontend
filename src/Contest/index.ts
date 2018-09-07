
import * as moment from 'moment';
import {Effect} from 'redux-saga';
import {call} from 'redux-saga/effects';
import {delay} from 'redux-saga';

import {Actions, ActionTypes, State} from '../app';
import {Contest} from '../types';

export {Header} from './Header';
export {ContestState} from './types';

const testContests : Contest[] = [
  {
    id: "1",
    title: "Contest name",
    description: "Lorem ipsum blah blah",
    logo_url: null,
    registration_open: true,
    registration_closes_at: moment('2018-09-05'),
    starts_at: moment('2018-09-05'),
    ends_at: moment('2018-09-10'),
    task: {
      id: "1",
      title: "task 1",
    },
  }
];

export function contestReducer (state: State, action: Actions): State {
  switch (action.type) {
    case ActionTypes.CONTEST_SELECTED: {
      const {contest} = action.payload;
      return {...state, contest};
    }
  }
  return state;
}

export function* loadContests (): IterableIterator<Effect> {
  // TODO
  yield call(delay, 500);
  return testContests;
}

export function* loadContest (id: string) : IterableIterator<Effect> {
  // TODO
  yield call(delay, 500);
  return testContests.find(contest => contest.id === id);
}
