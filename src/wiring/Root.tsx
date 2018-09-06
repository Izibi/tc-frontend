
import * as React from 'react';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';

import {State, actionCreators} from '../app';
import {Router} from '../router/Router';
import {AppError, ErrorReport} from '../errors';

type StoreProps = {
  lastError: null | AppError,
};
type Props = StoreProps & {dispatch: Dispatch};

class Root extends React.PureComponent<Props> {
  render () {
    const {lastError} = this.props;
    let dialog : JSX.Element | null = null;
    if (lastError) {
      dialog = <ErrorReport error={lastError}/>;
    }
    return (
      <>
        {(!lastError || lastError.source !== 'react') &&
          <div className="Root__container">
            <Router/>
          </div>}
        {dialog}
      </>
    );
  }
  componentDidCatch (error: Error | null, info: {componentStack: any}) {
    this.props.dispatch(actionCreators.reactError(error, info));
  }
  handleTeamTabChange = (newTabId: number) => {
    this.props.dispatch(actionCreators.activeTeamChanged(newTabId));
  };
}

function mapStateToProps (state : State) : StoreProps {
  const {lastError} = state;
  return {lastError};
}

export default connect(mapStateToProps)(Root);
