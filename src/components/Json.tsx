
import * as React from 'react';

type Props = {
  value: any
}

class Json extends React.PureComponent<Props> {
  render() {
    const {value} = this.props;
    const {unfold} = this.state;
    const style = {
      overflow: 'hidden',
      cursor: 'pointer',
      border: '1px solid black',
      padding: '1px',
    };
    return (
      <pre style={style} onClick={this.handleClick} >
        {JSON.stringify(value, null, unfold ? 2 : 0)}
      </pre>
    );
  }
  state = {
    unfold: false
  };
  handleClick = () => {
    this.setState({unfold: !this.state.unfold});
  };
}

export default Json;
