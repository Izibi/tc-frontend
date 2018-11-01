
import * as React from 'react';
import {connect} from 'react-redux';
import {Dialog} from '@blueprintjs/core';

import {actionCreators, State, DispatchProp} from '../app';
import {AppError} from './types';

type OuterProps = {error: AppError}
type StoreProps = {dump: string}
type Props = OuterProps & StoreProps & DispatchProp

function mapStateToProps (state: State): StoreProps {
  return {
    dump: (btoa(JSON.stringify(state)).match(/.{1,76}/g)||[]).join('\n')
  };
}

class Report extends React.PureComponent<Props> {
  render() {
    const {error: appError, dump} = this.props;
    return (
      <Dialog icon='error' isOpen={true} onClose={this.handleClearError} title={'Error'}>
        <div className='bp3-dialog-body' style={{overflowX: 'scroll'}}>
          <p style={{fontWeight: 'bold'}}>
            {"Something went wrong, please send us the text below to help us understand the problem."}
          </p>
          <textarea cols={80} rows={12} style={{fontSize: "8px"}} value={dump} readOnly/>
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
