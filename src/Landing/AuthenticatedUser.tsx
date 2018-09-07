
import * as React from 'react';
import {connect} from 'react-redux';

import {DispatchProp} from '../app';
import {Spinner} from '../components';
import {Link} from '../router';
import {User, Contest} from '../types';

import {LandingState} from './types';
import Header from './Header';

type RouteProps = {}

type StoreProps = {
  user: null | User,
  loaded: boolean,
  contests: null | Contest[],
}

type Props = RouteProps & StoreProps & DispatchProp

function mapStateToProps (state: LandingState, _props: RouteProps): StoreProps {
  const {user} = state;
  let loaded = false;
  let contests: Contest[] = [];
  const page = state.authenticated_user_landing_page;
  if (page && page.contests) {
    loaded = page.loaded;
    contests = page.contests;
  }
  return {user, loaded, contests};
}

class AuthenticatedUserPage extends React.PureComponent<Props> {
  render () {
    const {user, loaded, contests} = this.props;
    if (!user) return <Spinner/>;
    let contestList : JSX.Element = <Spinner/>;
    if (contests) {
      contestList =
        <ul>
          {contests.map((contest, index) =>
            <ContestItem key={contest.id} contest={contest} />)}
        </ul>
    }
    return (
      <div>
        <Header user={user} />
        {loaded
          ? <div>
              <p>{"AuthenticatedUser Landing Page"}</p>
              {contestList}
            </div>
          : <Spinner/>}
      </div>
    );
  }
}

export default connect(mapStateToProps)(AuthenticatedUserPage);

type ContestItemProps = {
  contest: Contest,
}

const ContestItem : React.StatelessComponent<ContestItemProps> = (props) => {
  const {contest} = props;
  return (
    <div key={contest.id}>
      <Link to="TaskResources" params={{contestId: contest.id, resourceIndex: 0}}>
        {contest.title}
      </Link>
    </div>
  );
}
