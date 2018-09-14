
import {Rule} from '../router';

import {routes as LandingRoutes} from '../Landing';
import {routes as TaskRoutes} from '../Task';
import {routes as TeamRoutes} from '../Team';
import {routes as ChainsRoutes} from '../Chains';

const routes : Rule<any>[] = [
  ...LandingRoutes,
  ...TaskRoutes,
  ...TeamRoutes,
  ...ChainsRoutes,
];

export default routes;
