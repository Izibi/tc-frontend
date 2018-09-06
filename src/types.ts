
import {Moment} from 'moment';

export type AnyAction = {
  type: string,
  payload: object,
}

export interface Action<T extends string, P> {
  type: T,
  payload: P,
}

export type User = {
  id: string,
  username: string,
  firstname: string,
  lastname: string,
}

export type Team = {
  name: string,
  access_code: string,
  is_open: boolean /* can new users join the team? */,
  is_locked: boolean /* contest started, team cannot be changed */,
}

export type TeamMember = {
  user: User,
  is_creator: boolean,
  member_since: Moment,
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
  task: Task,
}

export type ContestPeriod = {
  id: string,
  title: string,
  number: number,
  chain_election_at: Moment,
  main_game_id: string,
  main_game_starts_at: Moment,
}

export type Task = {
  id: string,
  title: string,
}

export type Game = {
  key: string,
  started_at: null | Moment,
  owner_team: null | Team,
  protocol: string,
}

export type Protocol = {
  parent_hash: null | string,
  hash: null | string,
}

export type Chain = {
  title: string,
  description: string,
  interface: string,
  implementation: string,
}
