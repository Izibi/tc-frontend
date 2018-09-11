
import {Moment} from 'moment';

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
  members: TeamMember[],
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
  current_period: ContestPeriod,
}

export type Task = {
  id: string,
  title: string,
}

export type TaskResource = {
  title: string,
  description: string,
} & ({url: string} | {html: string})

export type ContestPeriod = {
  id: string,
  title: string,
  day_number: number,
  chain_election_at: Moment,
  main_chain: Chain,
}

export type Chain = {
  title: string,
  description: string,
  interface: string,
  implementation: string,
}

export type Game = {
  key: string,
  starts_at: Moment,
  started_at: Moment | null,
  owner_team: Team | null,
  protocol_hash: string,
}

export type Protocol = {
  parent_hash: null | string,
  hash: null | string,
}
