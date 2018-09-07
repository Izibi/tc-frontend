
import {Contest, ContestPeriod, Chain} from '../types';

export type ContestState = {
  contest: Contest | undefined,
  contestPeriod: ContestPeriod | undefined,
  mainChain: Chain | undefined,
}
