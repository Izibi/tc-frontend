
import * as moment from 'moment';

import {Entity, User, Contest, Task, TaskResource, Team, TeamMember, Chain, ChainStatus, Game} from '../types';

import {BackendState as State, Collection, PreEntities} from './types';

export const selectors = {
  users: getUser,
  tasks: getTask,
  taskResources: getTaskResource,
  contests: getContest,
  teams: getTeam,
  teamMembers: getTeamMember,
  chains: getChain,
}

type Selector<K extends Collection> = (typeof selectors)[K]
type CollectionEntity<K extends Collection> = ReturnType<Selector<K>>
type CollectionFacets<K extends Collection> = PreEntities[K][string]
type CollectionEntityType<K extends Collection> = CollectionEntity<K> extends Entity<infer T> ? T : any;

function nullEntity<K extends Collection>(): EntityImpl<K> {
  return new EntityImpl<K>(null);
}
function thunkEntity<K extends Collection>(id: string): EntityImpl<K> {
  return new EntityImpl<K>(id);
}

var cache : Map<string, any> = new Map();
var cacheGeneration : number = -1;
function maybeClearCache(state: State) {
  if (cacheGeneration !== state.backend.generation) {
    cache = new Map();
    cacheGeneration = state.backend.generation;
  }
}

function visitEntity<K extends Collection>(
  state: State,
  collection: K,
  id: string | null,
  load: (entity: EntityImpl<K>, facets: CollectionFacets<K>) => void
): CollectionEntity<K> {
  maybeClearCache(state);
  const cacheKey = `${collection}_${id}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  const entity: EntityImpl<K> = id === null ? nullEntity() : thunkEntity(id);
  // (<any>entity)._k = collection;
  cache.set(cacheKey, entity);
  if (id !== null) {
    const facets = state.entities[collection][id];
    if (facets !== undefined) {
      entity.facets = facets;
      entity.isLoading = true;
      entity._value = undefined;
      load(entity, facets);
      entity.isLoading = false;
      if (entity._value !== undefined) {
        entity.isLoaded = true;
      } else {
        entity.isFailed = true;
      }
    }
  }
  return <CollectionEntity<K>>entity;
}

class EntityImpl<K extends Collection> {
  constructor(id: string | null) {
    this._id = id;
    this.isNull = id === null;
    this.isLoading = false;
    this.isLoaded = false;
    this.isFailed = false;
  }
  _id: string | null;
  _value: CollectionEntityType<K> | undefined;
  facets: CollectionFacets<K> | undefined;
  get id(): string {
    if (this._id === null) {
      throw new Error("entity has no id");
    }
    return this._id;
  }
  get value(): CollectionEntityType<K> {
    if (this._value === undefined) {
      throw new Error("entity has no value");
    }
    return this._value;
  }
  isNull: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  isFailed: boolean;
}

export function getUser (state: State, id: string | null): Entity<User> {
  return visitEntity(state, 'users', id, (entity, facets) => {
    const user = facets[''];
    entity._value = <User>user;
  });
}

export function getTask(state: State, id: string | null): Entity<Task> {
  return visitEntity(state, 'tasks', id, (entity, facets) => {
    const task = facets[''];
    const resources = facets.resources
      ? facets.resources.resourceIds.map(resourceId => getTaskResource(state, resourceId))
      : undefined;
    entity._value = <Task>{...task, resources};
  });
}

export function getTaskResource(state: State, id: string | null): Entity<TaskResource> {
  return visitEntity(state, 'taskResources', id, (entity, facets) => {
    const resource = facets[''];
    if (resource.html !== "") {
      entity._value = <TaskResource>{...resource, html: resource.html, url: undefined};
    } else if (resource.url !== "") {
      entity._value = <TaskResource>{...resource, url: resource.url, html: undefined};
    } else {
      entity._value = <TaskResource>{...resource, html: undefined, url: undefined};
    }
  });
}

export function getContest (state: State, id: string | null): Entity<Contest> {
  return visitEntity(state, 'contests', id, (entity, facets) => {
    const contest = facets[''];
    const task = getTask(state, contest.taskId);
    const startsAt = moment(contest.startsAt);
    const endsAt = moment(contest.endsAt);
    const registrationClosesAt = moment(contest.registrationClosesAt);
    const teams = facets.teams ? facets.teams.teamIds.map(teamId => getTeam(state, teamId)) : undefined;
    entity._value = <Contest>{...contest, task, startsAt, endsAt, registrationClosesAt, teams};
  });
}

export function getTeam (state: State, id: string | null): Entity<Team> {
  return visitEntity(state, 'teams', id, (entity, facets) => {
    const team = facets[''];
    const members = facets.members
      ? facets.members.memberIds.map(memberId => getTeamMember(state, memberId))
      : undefined;
    entity._value = <Team>{...team, members, ...facets['!']};
  });
}

export function getTeamMember (state: State, id: string | null): Entity<TeamMember> {
  return visitEntity(state, 'teamMembers', id, (entity, facets) => {
    const member = facets[''];
    const team = getTeam(state, member.teamId);
    const user = getUser(state,  member.userId);
    const joinedAt = moment(member.joinedAt);
    entity._value = <TeamMember>{...member, team, user, joinedAt};
  });
}

export function getChain (state: State, id: string | null): Entity<Chain> {
  return visitEntity(state, 'chains', id, (entity, facets) => {
    const {'': chain, details} = facets;
    const createdAt = moment(chain.createdAt);
    const updatedAt = moment(chain.updatedAt);
    const contest = getContest(state, chain.contestId);
    const owner = getTeam(state, chain.ownerId);
    const parent = getChain(state, chain.parentId);
    const status : ChainStatus = getChainStatus(chain.statusId);
    const game = getGame(state, chain.currentGameKey);
    entity._value = <Chain>{...chain, createdAt, updatedAt, contest, owner, parent, status, game, ...details};
  });
}

export function getGame(state: State, gameKey: string): Game | null {
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
    nbPlayers: game.nbPlayers,
    nbRounds: game.nbRounds,
    blocks,
  };
}

export function getChainStatus(statusId: string) : ChainStatus {
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
