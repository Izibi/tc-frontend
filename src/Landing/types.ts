
import {User, Contest} from '../types';

export type LandingState = {
  user: User | undefined,
  contests: Contest[] | undefined,
}
