
import * as React from 'react';
import {connect} from 'react-redux';

import Dev from '../components/Dev';
import {Link} from '../router';
import {State} from './types';

type RouteProps = {}

type StoreProps = {}

type Props = RouteProps & StoreProps

class UnauthenticatedUserPage extends React.PureComponent<Props> {
  render () {
    return (
      <div>
        <Dev>
           <Link to="TaskResources" params={{contestId: "1", resourceIndex: 0}}>{"test"}</Link>
        </Dev>
        <p>{"UnauthenticatedUser Landing Page"}</p>
      </div>
    );
  }
}

function mapStateToProps (_state: State, _props: RouteProps): StoreProps {
  return {};
}

export default connect(mapStateToProps)(UnauthenticatedUserPage);
