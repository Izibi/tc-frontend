
import * as React from 'react';
import {connect} from 'react-redux';

import {DispatchProp} from '../app';
import {Link} from '../router';
import {User, Contest} from '../types';

import {LandingState} from './types';
import Header from './Header';

type RouteProps = {}

type StoreProps = {
  user: User | undefined,
  contests: Contest[] | undefined,
}

type Props = RouteProps & StoreProps & DispatchProp

function mapStateToProps (state: LandingState, _props: RouteProps): StoreProps {
  const {user} = state;
  let contests: Contest[] | undefined;
  const page = state.authenticated_user_landing_page;
  if (page && page.contests) {
    contests = page.contests;
  }
  return {user, contests};
}

class AuthenticatedUserPage extends React.PureComponent<Props> {
  render () {
    const {user, contests} = this.props;
    if (!user) return false;
    let contestList : JSX.Element | undefined;
    if (contests) {
      contestList =
        <ul className="contestList">
          {contests.map((contest, index) =>
            <ContestItem key={contest.id} contest={contest} />)}
        </ul>
    }
    return (
      <div>
        <Header user={user} />
        <div className="landingContent">
          <p>{"AuthenticatedUser Landing Page"}</p>
          {contestList}
        </div>
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
    <li key={contest.id}>
      <div className="contestImage">
        {contest.logo_url && <img src="{contest.logo_url}" />}
      </div>
      <div className="contestInfos">
        <div className="contestTitle">{contest.title}</div>
        <div className="contestDates">{"Sep 05 to 10 2018"}</div>
        <div className="contestDescription">{contest.description}</div>
        <Link to="TaskResources" params={{contestId: contest.id, resourceIndex: 0}}>
          {contest.title}
        </Link>
      </div>
    </li>
  );
}