
import {User, Contest} from '../types';

type AuthenticatedUserLandingState = {
  loaded: boolean,
  contests: Contest[] | undefined,
  filter: "current" | "past",
}

export type LandingState = {
  user: User | undefined,
  authenticated_user_landing_page: AuthenticatedUserLandingState | undefined,
}
