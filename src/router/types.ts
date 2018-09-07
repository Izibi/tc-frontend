
export type Component = React.StatelessComponent<any> | React.ComponentClass<any>;

export type Rule = {
  name: string,
  pattern: string,
  component: Component,
  saga?: any,
}

export type Route = {
  ruleName: string,
  pathname: string,
  params: object,
  component: Component,
  saga?: any,
}

export type LinkProps = {
  to: string,
  params: object,
  target?: string,
  onClick?: ((event: React.MouseEvent<HTMLElement>) => void),
  children: React.ReactNode,
}

export type RouterState = {
  path: string,
  route: Route | undefined,
};
