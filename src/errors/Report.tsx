
import * as React from 'react';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {Dialog} from '@blueprintjs/core';

import {actionCreators} from '../app';
import {ErrorsState, AppError} from './types';

type Props = {error: AppError} & {dispatch: Dispatch}

function mapStateToProps (_state : ErrorsState) : {} {
  return {};
}

class Report extends React.PureComponent<Props> {
  render() {
    const appError = this.props.error;
    return (
      <Dialog icon='error' isOpen={true} onClose={this.handleClearError} title={'Error'}>
        <div className='bp3-dialog-body' style={{overflowX: 'scroll'}}>
          <p style={{fontWeight: 'bold'}}>
            {"Something went wrong…"}
          </p>
          <p>{'Source: '}{appError.source}</p>
          {appError.source === 'react' && appError.info &&
            <pre>{'Stack: '}{appError.info.componentStack}</pre>}
          {appError.error &&
            <pre>{'Stack: '}{appError.error.stack}</pre>}
        </div>
      </Dialog>
    );
  }
  handleClearError = () => {
    this.props.dispatch(actionCreators.clearError());
  };
}

export default connect(mapStateToProps)(Report);
