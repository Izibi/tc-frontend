
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
  deletedAt?: string,
  accessCode: string,
  isOpen: boolean /* can new users join the team? */,
  isLocked: boolean /* contest started, team cannot be changed */,
  members: Entity<TeamMember>[] | undefined,
  publicKey: string,
}

export type TeamMember = {
  user: Entity<User>,
  team: Entity<Team>,
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
  teams: Entity<Team>[] | undefined,
}

export type Task = {
  id: string,
  title: string,
  resources: Entity<TaskResource>[] | undefined,
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
  "private test" | "public test" | "candidate" | "main" | "past" | "invalid";

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
  nbCyclesPerRound: number,
  blocks: Immutable.List<BlockInfo>,
}

export type BlockInfo = {
  hash: string,
  type: "root" | "task" | "protocol" | "setup" | "command",
  sequence: number,
}

type BlockBase = {
  hash: string /* added when we load the block */,
  type: string,
  parent: string,
  sequence: number,
}
type RootBlock = {type: "root"}
type TaskBlock = {type: "task", identifier: string}
type ProtocolBlock = {type: "protocol", task: string, interface: string, implementation: string}
type SetupBlock = {type: "setup", task: string, protocol: string, params: string}
type CommandBlock = {type: "command", task: string, protocol: string}
export type Block = BlockBase & (RootBlock | TaskBlock | ProtocolBlock | SetupBlock | CommandBlock)

export type ChainFilters = {
  status: "" | "main" | "private_test" | "public_test" | "candidate" | "past",
}
