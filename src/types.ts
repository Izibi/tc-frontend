
import {Moment} from 'moment';

export enum EntityState {
  Null,
  Thunk,
  Loading,
  Loaded,
  Reloading,
  Error
}

export type Entity<T> =
  {state: EntityState.Null} |
  {state: EntityState.Thunk, id: string} |
  {state: EntityState.Loading, id: string} |
  {state: EntityState.Loaded, id: string, value: T} |
  {state: EntityState.Reloading, id: string, value: T} |
  {state: EntityState.Error, id: string}

export type AnyAction = {
  type: string,
  payload: object,
}

export type User = {
  id: string,
  username: string,
  firstname: string,
  lastname: string,
}

export type Team = {
  id: string,
  name: string,
  accessCode: string,
  isOpen: boolean /* can new users join the team? */,
  isLocked: boolean /* contest started, team cannot be changed */,
  members?: TeamMember[],
}

export type TeamMember = {
  user: Entity<User>,
  isCreator: boolean,
  joinedAt: Moment,
}

export type Contest = {
  id: string,
  title: string,
  description: string,
  logoUrl: string,
  registrationOpen: boolean,
  registrationClosesAt: Moment,
  startsAt: Moment,
  endsAt: Moment,
  task: Entity<Task>,
  currentPeriod: Entity<ContestPeriod>,
}

export type Task = {
  id: string,
  title: string,
  resources: Entity<TaskResource>[],
}

export type TaskResource = {
  id: string,
  rank: number,
  title: string,
  description: string,
  url: string | undefined,
  html: string | undefined,
}

export type ContestPeriod = {
  id: string,
  title: string,
  dayNumber: number,
  chainElectionAt: Moment,
  mainChain: Entity<Chain>,
}

export type ChainStatus =
  "private" | "public" | "candidate" | "main" | "past" | "invalid";

export type Chain = {
  id: string,
  contest: Entity<Contest>,
  team: Entity<Team>,
  parent: Entity<Chain>,
  createdAt: Moment,
  updatedAt: Moment,
  status: ChainStatus,
  nbVotesReject: number,
  nbVotesUnknown: number,
  nbVotesApprove: number,
  title: string,
  protocolHash: string,
  newProtocol: Entity<Protocol>,
  currentGame: Entity<Game>,
  currentBlockHash: string,
  currentRound: number,
}

export type Protocol = {
  description: string,
  interface: string,
  implementation: string,
  hash: string | undefined,
  /* errors? */
}

export type Game = {
  key: string,
  startsAt: Moment,
  startedAt: Moment | undefined,
  ownerTeam: Entity<Team>,
  protocolHash: string,
}
