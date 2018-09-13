
import {BackendState} from '../Backend';

export type LandingState = BackendState & {
  userId: string,
  contestIds: string[] | undefined,
}
