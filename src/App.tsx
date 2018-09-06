
import * as React from 'react';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {Dialog} from '@blueprintjs/core';

import {State} from './types';
import {actionCreators} from './actions';
import {Router} from './router/Router';

type OwnProps = {
  lastError: null | {
    source: string,
    error: Error | null,
    info?: {
      componentStack: any
    },
  },
};
type Props = OwnProps & {dispatch: Dispatch};

class App extends React.PureComponent<Props> {
  render () {
    const {lastError} = this.props;
    let dialog : JSX.Element | null = null;
    if (lastError) {
      dialog =
        <Dialog icon='error' isOpen={true} onClose={this.handleClearError} title={'Error'}>
          <div className='bp3-dialog-body' style={{overflowX: 'scroll'}}>
            <p style={{fontWeight: 'bold'}}>
              {"Something went wrong…"}
            </p>
            <p>{'Source: '}{lastError.source}</p>
            {lastError.source === 'react' && lastError.info &&
              <pre>{'Stack: '}{lastError.info.componentStack}</pre>}
            {lastError.error &&
              <pre>{'Stack: '}{lastError.error.stack}</pre>}
          </div>
        </Dialog>;
    }
    return (
      <>
        {(!lastError || lastError.source !== 'react') &&
          <div className="App__container">
            <Router/>
          </div>}
        {dialog}
      </>
    );
  }
  componentDidCatch (error: Error | null, info: {componentStack: any}) {
    this.props.dispatch(actionCreators.reactError(error, info));
  }
  handleClearError = () => {
    this.props.dispatch(actionCreators.clearError());
  };
  handleTeamTabChange = (newTabId: number) => {
    this.props.dispatch(actionCreators.activeTeamChanged(newTabId));
  };
}

function mapStateToProps (state : State) : OwnProps {
  const {lastError} = state;
  return {lastError};
}

export default connect(mapStateToProps)(App);
