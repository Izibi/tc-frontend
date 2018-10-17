
import {Moment} from 'moment';
import * as Immutable from 'immutable';

export {Entity, EntityState} from './Backend/entities';
import {Entity} from './Backend/entities';

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
  publicKey: string,
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
  createdAt: Moment,
  updatedAt: Moment,
  contest: Entity<Contest>,
  ownerId: string | null,
  owner: Entity<Team>,
  parent: Entity<Chain>,
  status: ChainStatus,
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
  game: Game | null,
}

export type Game = {
  key: string,
  createdAt: Moment,
  updatedAt: Moment,
  startedAt: Moment | null,
  roundEndsAt: Moment | null,
  owner: Entity<Team>,
  currentRound: number,
  isLocked: boolean,
  firstBlock: string,
  lastBlock: string,
  blocks: Immutable.List<Block>,
}

export type Block = {
  hash: string,
  type: "root" | "task" | "protocol" | "setup" | "command",
  sequence: number,
}
