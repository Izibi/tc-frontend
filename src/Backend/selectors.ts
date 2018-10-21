
import * as moment from 'moment';

import {Entity, User, Contest, ContestPeriod, Task, TaskResource, Team, TeamMember, Chain, ChainStatus, Game} from '../types';

import {BackendState as State, Entities} from './types';
import {nullEntity, projectEntity, thunkEntity, withEntityValue} from './entities';

var cache : Map<string, any> = new Map();
var cacheGeneration : number = -1;

type ValueOf<K extends keyof Entities> = Entities[K][string] extends Entity<infer T> ? T : any

function maybeClearCache(state: State) {
  if (cacheGeneration !== state.backend.generation) {
    cache = new Map();
    cacheGeneration = state.backend.generation;
  }
}

function visitEntity<K extends keyof Entities, T>(state: State, collection: K, id: string | null, func: (value: ValueOf<K>) => T): Entity<T> {
  maybeClearCache(state);
  const cacheKey = `${collection}_${id}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  const result: Entity<T> = id === null ? nullEntity() : thunkEntity(id);
  cache.set(cacheKey, result);
  const entity = get(state, collection, id) as any; // Entity<ValueOf<K>>
  result.assign(projectEntity(entity, func));
  return result;
}

function get<K extends keyof Entities>(state: State, collection: K, id: string | null): Entities[K][string] {
  if (id === null) return nullEntity<User>();
  const entities = state.entities[collection];
  if (id in entities) {
    return entities[id]
  } else {
    return thunkEntity<User>(id);
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
        return <TaskResource>{...resource, html: resource.html, url: undefined};
      }
      if (resource.url !== null) {
        return <TaskResource>{...resource, url: resource.url, html: undefined};
      }
      throw new Error('malformed task resource');
    }));
  }
  return results;
}

export function getContest (state: State, id: string | null): Entity<Contest> {
  return visitEntity(state, 'contests', id, (contest) => {
    const task = getTask(state, contest.taskId);
    //const currentPeriod = getContestPeriod(state, contest.currentPeriodId);
    const currentPeriod = nullEntity<ContestPeriod>(); // XXX
    const startsAt = moment(contest.startsAt);
    const endsAt = moment(contest.endsAt);
    const registrationClosesAt = moment(contest.registrationClosesAt);
    return <Contest>{...contest, task, currentPeriod, startsAt, endsAt, registrationClosesAt};
  });
}

export function getContestPeriod (state: State, id: string | null): Entity<ContestPeriod> {
  return visitEntity(state, 'contestPeriods', id, (period) => {
    const mainChain = getChain(state, period.mainChainId);
    const chainElectionAt = moment(period.chainElectionAt);
    return <ContestPeriod>{...period, mainChain, chainElectionAt};
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
    return <Team>{...team, members};
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
    const createdAt = moment(chain.createdAt);
    const updatedAt = moment(chain.updatedAt);
    const contest = getContest(state, chain.contestId);
    const owner = getTeam(state, chain.ownerId);
    const parent = getChain(state, chain.parentId);
    const status : ChainStatus = getChainStatus(chain.statusId);
    const game = getGame(state, chain.currentGameKey);
    return <Chain>{...chain, createdAt, updatedAt, contest, owner, parent, status, game};
  });
}

function getGame(state: State, gameKey: string): Game | null {
  maybeClearCache(state);
  const gameInfo = state.games.get(gameKey);
  if (gameInfo === undefined) {
    return null;
  }
  const {game, blocks} = gameInfo;
  return {
    key: game.key,
    createdAt: moment(game.createdAt),
    updatedAt: moment(game.updatedAt),
    startedAt: nullMoment(game.startedAt),
    roundEndsAt: nullMoment(game.roundEndsAt),
    owner: getTeam(state, game.ownerId),
    currentRound: game.currentRound,
    isLocked: game.isLocked,
    firstBlock: game.firstBlock,
    lastBlock: game.lastBlock,
    nbCyclesPerRound: game.nbCyclesPerRound,
    blocks,
  };
}

function getChainStatus(statusId: string) : ChainStatus {
  switch (statusId) {
    case "1": return "private test";
    case "2": return "public test";
    case "3": return "candidate";
    case "4": return "main";
    case "5": return "past";
    case "6": return "invalid";
    default: return "invalid";
  }
}

function nullMoment(s: string | null): moment.Moment | null {
  return s === null ? null : moment(s);
}
