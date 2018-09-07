
export {State} from './wiring/store';
export {Actions, actionCreators} from './wiring/actions';
export {Rule, navigate} from './router';
export {Link} from './router/Link';

import * as _ActionTypes from './wiring/action_types';
export const ActionTypes = _ActionTypes;

import {Position, Toaster} from "@blueprintjs/core";
export const AppToaster = Toaster.create({
  className: "app-toaster",
  position: Position.TOP_RIGHT,
});

import {DispatchProp as DispatchProp_} from 'react-redux';
import {Actions} from './wiring/actions';
export type DispatchProp = DispatchProp_<Actions>;
