
import * as React from 'react';
import {connect} from 'react-redux';

import {DispatchProp} from '../app';
import {Slot, Spinner} from '../components';
import {Link} from '../router';
import {Entity, Contest} from '../types';
import {selectors} from '../Backend';

import {LandingState} from './types';
import Header from './Header';

type RouteProps = {}

type StoreProps = {
  loading: boolean,
  contests: Entity<Contest>[],
}

type Props = RouteProps & StoreProps & DispatchProp

function mapStateToProps (state: LandingState, _props: RouteProps): StoreProps {
  if (state.contestIds === undefined) {
    return {loading: true, contests: []};
  } else {
    const contests = state.contestIds.map(id => selectors.getContest(state, id));
    return {loading: false, contests};
  }
}

class AuthenticatedUserPage extends React.PureComponent<Props> {
  render () {
    const {loading, contests} = this.props;
    let contestList : JSX.Element | null = null;
    if (contests && contests.length > 0) {
      contestList =
        <ul className="contestList">
          {contests.map((contest, index) =>
            'id' in contest
              ? <Slot<Contest> key={contest.id} component={ContestItem} entity={contest} />
              : null)}
        </ul>
    } else {
      contestList =
        <p>{"You do not have access to any contest at this time."}</p>;
    }
    return (
      <div>
        <Header/>
        <div className="landingContent">
          {loading && <Spinner/>}
          {contestList}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(AuthenticatedUserPage);

type ContestItemProps = {
  value: Contest,
  reloading: boolean,
}

const ContestItem : React.StatelessComponent<ContestItemProps> = (props) => {
  const {value: contest} = props;
  const range = contest.startsAt.twix(contest.endsAt, {allDay: true});
  return (
    <Link component="li" to="TaskResources" params={{contestId: contest.id, resourceIndex: 0}} key={contest.id}>
      <div className="contestImage">
        {contest.logoUrl && <img src="{contest.logo_url}" />}
      </div>
      <div className="contestInfos">
        <div className="contestTitle">{contest.title}</div>
        <div className="contestDates">{range.format()}</div>
        <div className="contestDescription">{contest.description}</div>
      </div>
    </Link>
  );
}
