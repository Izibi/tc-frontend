
import {Rule} from '../router';

import {routes as LandingRoutes} from '../Landing';
import {routes as TaskRoutes} from '../Task';

const routes : Rule[] = [
  ...LandingRoutes,
  ...TaskRoutes
];

export default routes;
