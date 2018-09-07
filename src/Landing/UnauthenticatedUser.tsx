
import * as React from 'react';
import {Button} from "@blueprintjs/core";
import {connect} from 'react-redux';

import {actionCreators, AppToaster, DispatchProp} from '../app';
import {Link} from '../router';
import Dev from '../components/Dev';
import {User} from '../types';

import {LandingState} from './types';
import Header from './Header';

type RouteProps = {}

type StoreProps = {}

type Props = RouteProps & StoreProps & DispatchProp

const devUsers : User[] = [
  {id: "1", username: "alice", firstname: "Alice", lastname: "Doe"},
  {id: "2", username: "bob", firstname: "Bob", lastname: "Smith"},
];

class UnauthenticatedUserPage extends React.PureComponent<Props> {
  render () {
    return (
      <div>
        <Header />
        <Dev>
          <Button onClick={this.handleLogin} data-username="alice">{"I am Alice"}</Button>
          <Button onClick={this.handleLogin} data-username="bob">{"I am Bob"}</Button>
          <Button onClick={this.toast}>{"Toast"}</Button>
          <Link to="TaskResources" params={{contestId: "1", resourceIndex: 0}}>{"test"}</Link>
        </Dev>
        <p>{"UnauthenticatedUser Landing Page"}</p>
      </div>
    );
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

function mapStateToProps (_state: LandingState, _props: RouteProps): StoreProps {
  return {};
}

export default connect(mapStateToProps)(UnauthenticatedUserPage);
