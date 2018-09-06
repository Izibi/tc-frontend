
import {createAction} from '../utils';

import * as ActionTypes from './action_types';

export const actionCreators = {

  init: () => createAction(ActionTypes.INIT, {}),

  ...require("../router").actionCreators,
  ...require("../errors").actionCreators,

};

type FunctionType = (...args: any[]) => any;
type ActionCreatorMapObject = {[actionCreator: string]: FunctionType};
type ActionsUnion<A extends ActionCreatorMapObject> = ReturnType<A[keyof A]>;
export type Actions = ActionsUnion<typeof actionCreators>;
