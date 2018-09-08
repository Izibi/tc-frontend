
import {Rule} from '../router';

import {routes as LandingRoutes} from '../Landing';
import {routes as TaskRoutes} from '../Task';
import {routes as TeamRoutes} from '../Team';

const routes : Rule[] = [
  ...LandingRoutes,
  ...TaskRoutes,
  ...TeamRoutes,
];

export default routes;
