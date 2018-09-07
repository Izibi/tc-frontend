
import * as React from 'react';
import {connect} from 'react-redux';

import {Spinner} from '../components';
import {User} from '../types';
import {LandingState} from './types';

type RouteProps = {}

type StoreProps = {
  user: null | User
}

type Props = RouteProps & StoreProps

function mapStateToProps (state: LandingState, _props: RouteProps): StoreProps {
  const {user} = state;
  return {user};
}

class AuthenticatedUserPage extends React.PureComponent<Props> {
  render () {
    const {user} = this.props;
    if (!user) return <Spinner/>;
    return (
      <div>
        <p>{"Hello, "}{user.firstname}{" "}{user.lastname}</p>
        <p>{"AuthenticatedUser Landing Page"}</p>
      </div>
    );
  }
}

export default connect(mapStateToProps)(AuthenticatedUserPage);
