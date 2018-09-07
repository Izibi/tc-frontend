
import {User, Contest} from '../types';

type AuthenticatedUserLandingState = {
  loaded: boolean,
  contests: null | Contest[],
  filter: "current" | "past",
}

export type LandingState = {
  user: null | User,
  authenticated_user_landing_page: AuthenticatedUserLandingState,
}
