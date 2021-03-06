
import * as React from 'react';

import {LinkProps} from './types';
import {linkTo, navigate} from './core';

export class Link extends React.PureComponent<LinkProps> {
  static defaultProps = {
    params: {},
    inline: true,
  };
  render () {
    const {to, params, text, children, className, inline, component} = this.props;
    if (inline && !component) {
      return (
        <a href={linkTo(to, params)} onClick={this.handleClick} className={className}>
          {childrenEmpty(children)  ? text : children}
        </a>
      );
    } else {
      let Component = component || "div";
      return <Component onClick={this.handleClick} className={className} style={{cursor: 'pointer'}}>{children}</Component>;
    }
  }
  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (this.props.onClick) this.props.onClick(event);
    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore everything but left clicks
      !this.props.target && // let browser handle "target=_blank" etc.
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();
      event.stopPropagation()
      /* XXX TODO handle replace prop */
      navigate(this.props.to, this.props.params);
    }
  }
}

function isModifiedEvent (event: React.MouseEvent<HTMLElement>) : boolean {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

function childrenEmpty (children: React.ReactNode): boolean {
  return !children || (
    typeof children === 'object' &&
    'length' in children &&
    children.length === 0);
}
