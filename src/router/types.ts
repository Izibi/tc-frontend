
import {State} from '../app';

export type Component = React.ComponentType<any>;

export type Rule<T extends object> = (StatefulRule<T> | PatternRule) & RuleTarget<T>

export type StatefulRule<T extends object> = {
  name: string,
  test: (state: State, pathname: string) => T | null,
  pathname: string,
}

export type PatternRule = {
  name: string,
  pattern: string,
}

export type RuleTarget<T extends object> = {
  component: Component,
  reducer: (state: State, params: T) => State,
  saga?: any,
}

export type Route<T extends object> = {
  rule: Rule<T>,
  pathname: string,
  params: T,
}

export type LinkProps = {
  to: string,
  params: object,
  target?: string,
  onClick?: ((event: React.MouseEvent<HTMLElement>) => void),
  text?: string,
  component?: React.ReactType,
  children?: React.ReactNode,
  className?: string,
  inline: boolean,
}

export type RouterState = {
  path: string,
  route: Route<object> | undefined,
};
