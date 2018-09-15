
import * as React from 'react';
import {Entity, EntityState} from '../types';
import {Spinner} from '../components';

type ComponentProps<T> = {
  value: T,
  reloading: boolean,
}

interface SlotProps<T> {
  component: React.ComponentType<ComponentProps<T>>,
  entity: Entity<T>,
  null?: JSX.Element,
  thunk?: JSX.Element,
  error?: JSX.Element,
  spin?: boolean,
}

export default class Slot<T> extends React.Component<SlotProps<T>> {
  render() {
    const {entity} = this.props;
    switch (entity.state) {
      case EntityState.Null:
        return this.props.null;
      case EntityState.Thunk:
        return this.props.thunk;
      case EntityState.Loading:
        return this.props.spin && <Spinner/>;
      case EntityState.Loaded: {
        const Component = this.props.component;
        return <Component value={entity.value} reloading={false} />;
      }
      case EntityState.Reloading: {
        const Component = this.props.component;
        return <Component value={entity.value} reloading />;
      }
      case EntityState.Error:
        return this.props.error;
    }
  }
  static defaultProps = {
    null: null,
    thunk: null,
    error: <div>{"error"}</div>,
    spin: true,
  };
}
