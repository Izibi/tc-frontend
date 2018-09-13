
import {BackendState} from '../Backend';

export type ContestState = BackendState & {
  user_id: string | undefined,
  contest_id: string | undefined,
}
