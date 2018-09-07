
import {Contest, ContestPeriod, Chain} from '../types';

export type ContestState = {
  contest: null | Contest,
  contestPeriod: null | ContestPeriod,
  mainChain: null | Chain,
}
