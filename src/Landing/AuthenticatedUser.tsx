
import * as React from 'react';
import {connect} from 'react-redux';

import {actionCreators, DispatchProp} from '../app';
import {Spinner} from '../components';
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
  const {loaded, contests} = state.authenticated_user_landing_page;
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
            <ContestItem key={contest.id} contest={contest} onSelect={this.handleContestSelected} />)}
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
  handleContestSelected = (contest: Contest) => {
    this.props.dispatch(actionCreators.contestSelected(contest));
  };
}

export default connect(mapStateToProps)(AuthenticatedUserPage);

type ContestItemProps = {
  contest: Contest,
  onSelect: (contest: Contest) => void,
}

class ContestItem extends React.PureComponent<ContestItemProps> {
  render () {
    const {contest} = this.props;
    return (
      <li key={contest.id} onClick={this.handleClick} >
        {contest.title}
      </li>
    );
  }
  handleClick = () => {
    this.props.onSelect(this.props.contest);
  };
}
