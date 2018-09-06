
import {Rule} from '../router';

import UnauthenticatedUserPage from './UnauthenticatedUser';

export {LandingState} from './types';

export const routes : Rule[] = [
  {
    name: "UnauthenticatedUser",
    pattern: "/",
    component: UnauthenticatedUserPage,
  },
];
