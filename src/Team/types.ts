
import {Contest, Team, User}  from '../types';

export type TeamState = {
  user: User | undefined,
  team: Team | undefined | 'unknown',
  contest: Contest | undefined,
}

export type TeamManagementParams = {
  contestId: string
}
