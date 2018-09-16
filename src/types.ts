
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
  access_code: string,
  is_open: boolean /* can new users join the team? */,
  is_locked: boolean /* contest started, team cannot be changed */,
  members?: TeamMember[],
}

export type TeamMember = {
  user: Entity<User>,
  is_creator: boolean,
  joined_at: Moment,
}

export type Contest = {
  id: string,
  title: string,
  description: string,
  logo_url: string,
  registration_open: boolean,
  registration_closes_at: Moment,
  starts_at: Moment,
  ends_at: Moment,
  task: Entity<Task>,
  current_period: Entity<ContestPeriod>,
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
  day_number: number,
  chain_election_at: Moment,
  main_chain: Entity<Chain>,
}

export type Chain = {
  id: string,
  contest: Entity<Contest>,
  team: Entity<Team>,
  parent: Entity<Chain>,
  created_at: Moment,
  updated_at: Moment,
  status: "private" | "public" | "candidate" | "main" | "past" | "invalid",
  nb_votes_reject: number,
  nb_votes_unknown: number,
  nb_votes_approve: number,
  title: string,
  protocol_hash: string,
  new_protocol: Entity<Protocol>,
  current_game: Entity<Game>,
  current_block_hash: string,
  current_round: number,
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
  starts_at: Moment,
  started_at: Moment | undefined,
  owner_team: Entity<Team>,
  protocol_hash: string,
}
