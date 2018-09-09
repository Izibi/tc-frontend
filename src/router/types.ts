
import {State} from '../app';

export type Component = React.StatelessComponent<any> | React.ComponentClass<any>;

export type Rule = (StatefulRule | PatternRule) & RuleTarge

export type StatefulRule = {
  name: string,
  test: (state: State, pathname: string) => object | null,
  pathname: string,
}

export type PatternRule = {
  name: string,
  pattern: string,
}

export type RuleTarge = {
  component: Component,
  saga?: any,
}

export type Route = {
  rule: Rule,
  pathname: string,
  params: object,
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
}

export type RouterState = {
  path: string,
  route: Route | undefined,
};
