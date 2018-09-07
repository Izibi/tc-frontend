
import * as React from 'react';
import {connect} from 'react-redux';

import {Contest} from '../types';
import {ContestState} from './types';
import {Spinner} from '../components';

type IProps = {}

type StoreProps = {
  contest: null | Contest
}

type Props = StoreProps

function mapStateToProps (state: ContestState, _props: IProps): StoreProps {
  const {contest} = state;
  return {contest};
}

class Header_ extends React.PureComponent<Props> {
  render() {
    const {contest} = this.props;
    if (!contest) return <Spinner/>;
    return (
      <div>
        <p>{"TODO: platform logo"}</p>
        <p>{contest.title}</p>
      </div>
    );
  }
}

export const Header = connect(mapStateToProps)(Header_);
