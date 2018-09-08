
import {User, Contest, ContestPeriod, Chain} from '../types';

export type ContestState = {
  user: User | undefined,
  contest: Contest | undefined,
  contestPeriod: ContestPeriod | undefined,
  mainChain: Chain | undefined,
}
