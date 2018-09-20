
import * as React from 'react';
import {connect} from 'react-redux';
import {AnchorButton, Button} from "@blueprintjs/core";

import {State, actionCreators, AppToaster, DispatchProp} from '../app';
import {Link, Router} from '../router';
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
            <hr/>
            <Dev>
              <Button onClick={this.handleLogout} >{"I am no one"}</Button>
              <AnchorButton href={'http://localhost:8080/Login/1'} target='_blank' text="I am Alice"/>
              <AnchorButton href={'http://localhost:8080/Login/2'} target='_blank' text="I am Bob"/>
              <Button onClick={this.toast}>{"Toast"}</Button>
              <Link to="TaskResources" params={{contestId: "1", resourceIndex: 0}} text="task resources" />
              <Link to="TeamManagement" params={{contestId: "1"}} text="team management" />
            </Dev>
          </div>}
        {dialog}
      </>
    );
  }
  componentDidCatch (error: Error, info: {componentStack: any}) {
    this.props.dispatch(actionCreators.reactError(error, info));
  }
  handleLogout = (event: React.MouseEvent<HTMLElement>) => {
    this.props.dispatch(actionCreators.userLoggedOut());
  };
  handleLogin = (event: React.MouseEvent<HTMLElement>) => {
    const userId = event.currentTarget.getAttribute('data-user-id') || 'unknown';
    this.props.dispatch(actionCreators.userLoggedIn(userId));
  };
  toast = () => {
    AppToaster.show({message: "Toasty!"});
  };
}

function mapStateToProps (state : State) : StoreProps {
  const {lastError} = state;
  return {lastError};
}

export default connect(mapStateToProps)(Root);
