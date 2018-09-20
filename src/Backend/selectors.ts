
import * as moment from 'moment';

import {Entity, User, Contest, ContestPeriod, Task, TaskResource, Team, TeamMember, Chain, ChainStatus} from '../types';

import {BackendState as State, Entities} from './types';
import {nullEntity, projectEntity, thunkEntity, withEntityValue} from './entities';

var cache : Map<string, any> = new Map();
var cacheGeneration : number = -1;

type ValueOf<K extends keyof Entities> = Entities[K][string] extends Entity<infer T> ? T : any

function visitEntity<K extends keyof Entities, T>(state: State, collection: K, id: string | null, func: (value: ValueOf<K>) => T): Entity<T> {
  if (cacheGeneration !== state.backend.generation) {
    cache = new Map();
    cacheGeneration = state.backend.generation;
  }
  const cacheKey = `${collection}_${id}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  const result = {} as Entity<T> /* result will be an Entity<T> after Object.assign below */;
  cache.set(cacheKey, result);
  const entity = get(state, collection, id) as Entity<ValueOf<K>>;
  Object.assign(result, projectEntity(entity, func));
  return result;
}

function get<K extends keyof Entities>(state: State, collection: K, id: string | null): Entities[K][string] {
  if (id === null) return nullEntity();
  const entities = state.entities[collection];
  if (id in entities) {
    return entities[id]
  } else {
    return thunkEntity(id);
  }
}

export function getUser (state: State, id: string | null): Entity<User> {
  return get(state, 'users', id);
}

export function getTask(state: State, id: string | null): Entity<Task> {
  return visitEntity(state, 'tasks', id, task => {
    const resources = getTaskResources(state, task.id);
    return {...task, resources};
  });
}

export function getTaskResources(state: State, taskId: string): Entity<TaskResource>[] {
  const results: Entity<TaskResource>[] = [];
  const ids = ["1", "2", "3", "4", "5"]; // XXX
  for (let id of ids) {
    results.push(visitEntity(state, 'taskResources', id, (resource) => {
      if (resource.html !== null) {
        return {...resource, html: resource.html, url: undefined};
      } else if (resource.url !== null) {
        return {...resource, url: resource.url, html: undefined};
      } else {
        throw new Error('malformed task resource');
      }
    }));
  }
  return results;
}

export function getContest (state: State, id: string | null): Entity<Contest> {
  return visitEntity(state, 'contests', id, (contest) => {
    const task = getTask(state, contest.taskId);
    const currentPeriod = getContestPeriod(state, contest.currentPeriodId);
    const startsAt = moment(contest.startsAt);
    const endsAt = moment(contest.endsAt);
    const registrationClosesAt = moment(contest.registrationClosesAt);
    return {...contest, task, currentPeriod, startsAt, endsAt, registrationClosesAt};
  });
}

export function getContestPeriod (state: State, id: string | null): Entity<ContestPeriod> {
  return visitEntity(state, 'contestPeriods', id, (period) => {
    const mainChain = getChain(state, period.mainChainId);
    const chainElectionAt = moment(period.chainElectionAt);
    return {...period, mainChain, chainElectionAt};
  });
}

export function getTeams (state: State /* TODO: filter */): Team[] {
  const result: Team[] = [];
  for (let entity of Object.values(state.entities.teams)) {
    withEntityValue(entity, value => {
      // TODO: test filter
      result.push(value);
    });
  }
  return result;
}

export function getTeam (state: State, id: string | null): Entity<Team> {
  return visitEntity(state, 'teams', id, (team) => {
    const members = getTeamMembers(state, team.id);
    return {...team, members};
  });
}

export function getTeamMembers (state: State, teamId: string): TeamMember[] {
  const results: TeamMember[] = [];
  for (let item of Object.values(state.entities.teamMembers)) {
    withEntityValue(item, value => {
      if (value.teamId === teamId) {
        const user = getUser(state,  value.userId);
        const joinedAt = moment(value.joinedAt);
        const member = {...value, user, joinedAt};
        results.push(member);
      }
    });
  }
  return results;
}

export function getChain (state: State, id: string | null): Entity<Chain> {
  return visitEntity(state, 'chains', id, (chain) => {
    const contest = getContest(state, chain.contestId);
    const team = getTeam(state, chain.teamId);
    const parent = getChain(state, chain.parentId);
    const createdAt = moment(chain.createdAt);
    const updatedAt = moment(chain.updatedAt);
    const newProtocol = nullEntity(); // TODO
    const currentGame = nullEntity(); // TODO
    const status = checkChainStatus(chain.status);
    return {...chain, contest, team, parent, createdAt, updatedAt, status, newProtocol, currentGame};
  });
}

function checkChainStatus(status: string) : ChainStatus {
  switch (status) {
    case "private":
    case "public":
    case "candidate":
    case "main":
    case "past":
    case "invalid":
      return status;
   default:
     return "invalid";
  }
}
