
import {Rule} from '../router';

export {State} from './types';

import UnauthenticatedUserPage from './UnauthenticatedUser';

export const routes : Rule[] = [
  {
    name: "UnauthenticatedUser",
    pattern: "/",
    component: UnauthenticatedUserPage,
  },
];
