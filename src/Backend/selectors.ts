
import * as moment from 'moment';

import {BackendState as State, Entities} from './types';
import {User, Contest, ContestPeriod, Task, TaskResource, Team, TeamMember, Chain} from '../types';

class IncompleteDataError extends Error {
  constructor(collection: string, index: string) {
    super(`no data for ${collection}[${index}]`);
  }
}

function safeGet<T extends keyof Entities>(state: State, collection: T, id: string): Entities[T][string] {
  const result = state.entities[collection][id];
  if (!result) throw new IncompleteDataError(collection, id);
  return result;
}

export function getUser (state: State, id: string): User {
  return safeGet(state, 'users', id);
}

export function getTask(state: State, id: string): Task {
  return safeGet(state, 'tasks', id);
}

export function getTaskResources(state: State, taskId: string): TaskResource[] {
  const results: TaskResource[] = [];
  for (let item of Object.values(state.entities.taskResources)) {
    if (item.task_id === taskId) {
      let resource: TaskResource;
      if (item.html !== null) {
        let temp = {...item, html: item.html, url: undefined};
        resource = temp;
      } else if (item.url !== null) {
        let temp = {...item, url: item.url, html: undefined};
        resource = temp;
      } else {
        throw new Error('malformed task resource');
      }
      results.push(resource);
    }
  }
  return results;
}

export function getContest (state: State, id: string): Contest {
  const contest = safeGet(state, 'contests', id);
  const task = getTask(state, contest.task_id);
  const current_period = getContestPeriod(state, contest.current_period_id);
  const starts_at = moment(contest.starts_at);
  const ends_at = moment(contest.ends_at);
  const registration_closes_at = moment(contest.registration_closes_at);
  const result = {...contest, task, current_period, starts_at, ends_at, registration_closes_at};
  return result;
}

export function getContestPeriod (state: State, id: string): ContestPeriod {
  const period = safeGet(state, 'contestPeriods', id);
  const main_chain = getChain(state, period.main_chain_id);
  const chain_election_at = moment(period.chain_election_at);
  const result = {...period, main_chain, chain_election_at};
  return result;
}

export function getTeam (state: State, id: string): Team {
  const team = safeGet(state, 'teams', id);
  const members = getTeamMembers(state, id);
  const result = {...team, members};
  return result;
}

export function getTeamMembers (state: State, teamId: string): TeamMember[] {
  const results: TeamMember[] = [];
  for (let item of Object.values(state.entities.teamMembers)) {
    if (item.team_id === teamId) {
      const user = safeGet(state, 'users', item.user_id);
      const joined_at = moment(item.joined_at);
      const member = {...item, user, joined_at};
      results.push(member);
    }
  }
  return results;
}

export function getChain (state: State, id: string): Chain {
  return safeGet(state, 'chains', id);
}
