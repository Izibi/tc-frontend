
import * as React from 'react';
import {connect} from 'react-redux';
import {Button} from "@blueprintjs/core";

import {State, actionCreators, AppToaster, DispatchProp} from '../app';
import {Link, Router} from '../router';
import {AppError, ErrorReport} from '../errors';
import {Dev} from '../components';
import {User} from '../types';
import {BackendFeedback} from '../Backend';

const devUsers : User[] = [
  {id: "1", username: "alice", firstname: "Alice", lastname: "Doe"},
  {id: "2", username: "bob", firstname: "Bob", lastname: "Smith"},
];

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
              <Button onClick={this.handleLogin} data-username="alice">{"I am Alice"}</Button>
              <Button onClick={this.handleLogin} data-username="bob">{"I am Bob"}</Button>
              <Button onClick={this.toast}>{"Toast"}</Button>
              <Link to="TaskResources" params={{contestId: "1", resourceIndex: 0}}>{"test"}</Link>
            </Dev>
          </div>}
        {dialog}
      </>
    );
  }
  componentDidCatch (error: Error, info: {componentStack: any}) {
    this.props.dispatch(actionCreators.reactError(error, info));
  }
  handleLogin = (event: React.MouseEvent<HTMLElement>) => {
    const username = event.currentTarget.getAttribute('data-username');
    const user = devUsers.find(user => user.username === username);
    if (user) {
      this.props.dispatch(actionCreators.userLoggedIn(user));
    }
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
