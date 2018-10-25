
import {Moment} from 'moment';
import * as Immutable from 'immutable';

export type AnyAction = {
  type: string,
  payload: object,
}

export interface Entity<T> {
  readonly isNull: boolean,
  readonly isLoading: boolean,
  readonly isLoaded: boolean,
  readonly id: string,
  readonly value: T,
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
  accessCode: string | undefined,
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
  // currentPeriod: Entity<ContestPeriod>,
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

export type ChainFilters = {
  status: "" | "main" | "private_test" | "public_test" | "candidate" | "past",
}

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
  nbPlayers: number,
  nbRounds: number,
  blocks: Immutable.List<BlockIndexEntry> /* seq -> hash */,
  players: Player[] | undefined,
}

export type BlockIndexEntry = {
  hash: string,
  type: string,
  sequence: number,
}

export type Player = {
  rank: number,
  team: Entity<Team>,
  botId: number,
}

/* Data loaded for a specific block. */
export type BlockData = {
  hash: string,
  block?: Block,
  scores?: ScoreBoard,
}

export type Block = BlockBase & (RootBlock | TaskBlock | ProtocolBlock | SetupBlock | CommandBlock)

type BlockBase = {
  type: BlockType,
  parent: string,
  sequence: number,
}

export type BlockType =
  "root" | "task" | "protocol" | "setup" | "command"

type RootBlock = {type: "root"}
type TaskBlock = {type: "task", identifier: string}
type ProtocolBlock = {type: "protocol", task: string, interface: string, implementation: string}
type SetupBlock = {type: "setup", task: string, protocol: string, params: string}
type CommandBlock = {type: "command", task: string, protocol: string}

export type ScoreBoard = {
  maxScore: number,
  rankings: PlayerRanking[],
}

export type PlayerRanking = {
  score: number,
  rank: number,
}
