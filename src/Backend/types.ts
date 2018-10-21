
import * as Immutable from 'immutable';

import {Entity, BlockInfo} from '../types';

export interface EntityMap<T> {
  [key: string]: Entity<T>;
}

export type BackendState = {
  backend: {
    generation: number,
    lastError: string | undefined,
    tasks: object[],
  },
  eventSource: {
    key: string,
    channels: string[],
  },
  entities: Entities,
  games: Immutable.Map<string, GameInfo> /* game key -> sparse list of blocks */,
}

export type GameInfo = {
  game: Game,
  blocks: Immutable.List<BlockInfo>,
}

export type Entities = {
  users: EntityMap<User>,
  contests: EntityMap<Contest>,
  tasks: EntityMap<Task>,
  taskResources: EntityMap<TaskResource>,
  contestPeriods: EntityMap<ContestPeriod>,
  teams: EntityMap<Team>,
  teamMembers: EntityMap<TeamMember>,
  chains: EntityMap<Chain>,
}

export type EntitiesUpdate = {[key: string]: object | null}

/* Types of entities as they are received from the backend. */

export type User = {
  id: string,
  username: string,
  firstname: string,
  lastname: string,
}

export type Team = {
  id: string,
  createdAt: string,
  updatedAt: string,
  deletedAt?: string,
  accessCode: string,
  contestId: string,
  isOpen: boolean,
  isLocked: boolean,
  name: string,
  publicKey: string,
}

export type TeamMember = {
  teamId: string,
  userId: string,
  joinedAt: string,
  isCreator: boolean,
}

export type Contest = {
  id: string,
  title: string,
  description: string,
  logoUrl: string,
  registrationOpen: boolean,
  registrationClosesAt: string,
  startsAt: string,
  endsAt: string,
  taskId: string,
  currentPeriodId: string,
}

export type Task = {
  id: string,
  title: string,
}

export type TaskResource = {
  id: string,
  taskId: string,
  rank: number,
  title: string,
  description: string,
  url: string | null,
  html: string | null,
}

export type ContestPeriod = {
  id: string,
  title: string,
  dayNumber: number,
  chainElectionAt: string,
  mainChainId: string,
}

export type Chain = {
  id: string,
  createdAt: string,
  updatedAt: string,
  contestId: string,
  ownerId: string | null,
  parentId: string | null,
  statusId: string,
  title: string,
  description: string,
  interfaceText: string,
  implementationText: string,
  protocolHash: string,
  newProtocolHash: string,
  currentGameKey: string,
  currentRound: number,
  nbVotesApprove: number,
  nbVotesReject: number,
  nbVotesUnknown: number,
}

export type Game = {
  key: string,
  createdAt: string,
  updatedAt: string,
  startedAt: string | null,
  roundEndsAt: string | null,
  ownerId: string,
  isLocked: boolean,
  firstBlock: string,
  lastBlock: string,
  currentRound: number,
  nbCyclesPerRound: number,
}
