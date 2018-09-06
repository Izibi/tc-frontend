
import {Rule} from '../router';

export {State} from './types';

import TaskResourcesPage from './TaskResources';

export const routes : Rule[] = [
  {
    name: "TaskResources",
    pattern: "/contests/:contestId/task/:resourceIndex",
    component: TaskResourcesPage,
  },
];
