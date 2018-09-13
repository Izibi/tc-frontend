
import * as React from 'react';
import {connect} from 'react-redux';

import {DispatchProp} from '../app';
import {Link} from '../router';
import {Contest} from '../types';
import {selectors} from '../Backend';

import {LandingState} from './types';
import Header from './Header';

type RouteProps = {}

type StoreProps = {
  contests: Contest[] | undefined,
}

type Props = RouteProps & StoreProps & DispatchProp

function mapStateToProps (state: LandingState, _props: RouteProps): StoreProps {
  try {
    const contests = (state.contestIds||[]).map(id => selectors.getContest(state, id));
    return {contests};
  } catch (ex) {
    console.error(ex);
    return {contests: undefined};
  }
}

class AuthenticatedUserPage extends React.PureComponent<Props> {
  render () {
    const {contests} = this.props;
    let contestList : JSX.Element | undefined;
    if (contests) {
      contestList =
        <ul className="contestList">
          {contests.map((contest, index) =>
            <ContestItem key={contest.id} contest={contest} />)}
        </ul>
    }
    console.log('contests', contests);
    return (
      <div>
        <Header/>
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
