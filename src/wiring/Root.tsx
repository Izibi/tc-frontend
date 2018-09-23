
import * as React from 'react';
import {connect} from 'react-redux';

import {State, actionCreators, DispatchProp} from '../app';
import {Router} from '../router';
import {AppError, ErrorReport} from '../errors';
import {Dev} from '../components';
import {BackendFeedback} from '../Backend';

type StoreProps = {
  lastError: AppError | undefined,
};
type Props = StoreProps & DispatchProp;

class Root extends React.PureComponent<Props> {
  render () {
    const {lastError} = this.props;
    let dialog : JSX.Element | undefined;
    if (lastError) {
      dialog = <ErrorReport error={lastError}/>;
    }
    return (
      <>
        {(!lastError || lastError.source !== 'react') &&
          <div className="Root__container">
            <BackendFeedback/>
            <Router/>
            <Dev>
              {/* dev controls go here */}
            </Dev>
          </div>}
        {dialog}
      </>
    );
  }
  componentDidCatch (error: Error, info: {componentStack: any}) {
    this.props.dispatch(actionCreators.reactError(error, info));
  }
}

function mapStateToProps (state : State) : StoreProps {
  const {lastError} = state;
  return {lastError};
}

export default connect(mapStateToProps)(Root);
