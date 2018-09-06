
import {Contest} from '../types';

type AuthenticatedUserLandingState = {
  loaded: boolean,
  contests: null | Contest[],
  filter: "current" | "past",
}

export type LandingState = {
  authenticated_user_landing_page: AuthenticatedUserLandingState,
}
