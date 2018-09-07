
import {Contest, ContestPeriod, Chain} from '../types';

export type ContestState = {
  contest: null | Contest,
  contest_period: null | ContestPeriod,
  main_chain: null | Chain,
}
