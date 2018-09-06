
import {Contest} from '../types';

type AuthenticatedUserLandingState = {
  loaded: boolean,
  contests: null | Contest[],
  filter: "current" | "past",
}

export type State = {
  authenticated_user_landing_page: AuthenticatedUserLandingState,
}
