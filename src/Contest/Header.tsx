
import * as React from 'react';
import {connect} from 'react-redux';

import {Contest} from '../types';
import {ContestState} from './types';

type IProps = {}

type StoreProps = {
  contest: Contest | undefined
}

type Props = StoreProps

function mapStateToProps (state: ContestState, _props: IProps): StoreProps {
  const {contest} = state;
  return {contest};
}

class Header_ extends React.PureComponent<Props> {
  render() {
    const {contest} = this.props;
    if (!contest) return false;
    return (
      <div className="platformHeader">
        <div className="platformLogo"><span>{"T"}</span><span>{"C"}</span></div>
        <div className="contestTitle">{contest.title}</div>
      </div>
    );
  }
}

export const Header = connect(mapStateToProps)(Header_);
