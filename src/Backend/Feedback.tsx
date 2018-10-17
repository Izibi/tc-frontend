
import * as React from 'react';
import {connect} from 'react-redux';
import {Icon} from "@blueprintjs/core";

import {DispatchProp} from '../app';
import {Spinner} from '../components';

import {BackendState} from './types';

type OuterProps = {}

type StoreProps = {
  busy: boolean,
  error: string | undefined,
}

type Props = OuterProps & StoreProps & DispatchProp

function mapStateToProps (state: BackendState, props: OuterProps): StoreProps {
  const {tasks, lastError} = state.backend;
  const busy = tasks.length !== 0;
  return {busy, error: lastError};
}

class BackendFeedback extends React.PureComponent<Props> {
  render () {
    const {busy, error} = this.props;
    return (
      <div style={{position: 'fixed', top: '10px', right: '10px'}}>
        {busy && <Spinner/>}
        {error && <span title={error}><Icon icon="warning-sign"/></span>}
      </div>
    );
  }
}

export default connect(mapStateToProps)(BackendFeedback);
