
import {User, Team}  from '../types';

export type TeamState = {
  user: User | undefined,
  team: Team | undefined,
}

export type TeamManagementParams = {
  contestId: string
}
