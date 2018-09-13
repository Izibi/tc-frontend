
export interface IdMap<T> {
  [key: string]: T;
}

export type BackendState = {
  backend: {
    lastError: string | undefined,
    tasks: object[],
  },
  entities: Entities,
}

export type Entities = {
  users: IdMap<User>,
  contests: IdMap<Contest>,
  tasks: IdMap<Task>,
  taskResources: IdMap<TaskResource>,
  contestPeriods: IdMap<ContestPeriod>,
  teams: IdMap<Team>,
  teamMembers: IdMap<TeamMember>,
  chains: IdMap<Chain>,
}

export type EntitiesUpdate = {
  users?: IdMap<User>,
  contests?: IdMap<Contest>,
  tasks?: IdMap<Task>,
  taskResources?: IdMap<TaskResource>,
  contestPeriods?: IdMap<ContestPeriod>,
  teams?: IdMap<Team>,
  teamMembers?: IdMap<TeamMember>,
  chains?: IdMap<Chain>,
}

/* Types of entities as they are received from the backend. */

export type Team = {
  id: string,
  created_at: string,
  access_code: string,
  contest_id: string,
  is_open: boolean,
  is_locked: boolean,
  name: string,
  public_key: string,
}

export type TeamMember = {
  team_id: string,
  user_id: string,
  joined_at: string,
  is_creator: boolean,
}

export type User = {
  id: string,
  username: string,
  firstname: string,
  lastname: string,
}

export type Contest = {
  id: string,
  title: string,
  description: string,
  logo_url: string,
  registration_open: boolean,
  registration_closes_at: string,
  starts_at: string,
  ends_at: string,
  task_id: string,
  current_period_id: string,
}

export type Task = {
  id: string,
  title: string,
}

export type TaskResource = {
  id: string,
  task_id: string,
  rank: number,
  title: string,
  description: string,
  url: string | null,
  html: string | null,
}

export type ContestPeriod = {
  id: string,
  title: string,
  day_number: number,
  chain_election_at: string,
  main_chain_id: string,
}

export type Chain = {
  id: string,
  title: string,
  description: string,
  interface: string,
  implementation: string,
  current_game_key: string,
}
