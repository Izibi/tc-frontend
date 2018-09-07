
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
  const {user, contests} = state;
  return {user, contests};
}

class AuthenticatedUserPage extends React.PureComponent<Props> {
  render () {
    const {user, contests} = this.props;
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
  const range = contest.starts_at.twix(contest.ends_at, {allDay: true});
  return (
    <Link component="li" to="TaskResources" params={{contestId: contest.id, resourceIndex: 0}} key={contest.id}>
      <div className="contestImage">
        {contest.logo_url && <img src="{contest.logo_url}" />}
      </div>
      <div className="contestInfos">
        <div className="contestTitle">{contest.title}</div>
        <div className="contestDates">{range.format()}</div>
        <div className="contestDescription">{contest.description}</div>
      </div>
    </Link>
  );
}
