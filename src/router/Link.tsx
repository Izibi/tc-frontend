
import * as React from 'react';

import {LinkProps} from './types';
import {linkTo, navigate} from './core';

export class Link extends React.PureComponent<LinkProps> {
  static defaultProps = {
    params: {}
  };
  render () {
    const {to, params, children} = this.props;
    return <a href={linkTo(to, params)} onClick={this.handleClick}>{children}</a>;
  }
  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log('handleClick');
    if (this.props.onClick) this.props.onClick(event);
    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore everything but left clicks
      !this.props.target && // let browser handle "target=_blank" etc.
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();
      /* XXX TODO handle replace prop */
      navigate(this.props.to, this.props.params);
    }
  }
}

function isModifiedEvent (event: React.MouseEvent<HTMLElement>) : boolean {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
