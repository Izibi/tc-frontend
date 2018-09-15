
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
    var cache = new WeakMap();
    function replacer (key: string, value: any): any {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return "circular";
        }
        cache.set(value, true);
      }
      return value;
    }
    const text = JSON.stringify(value, replacer, unfold ? 2 : 0);
    return (
      <pre style={style} onClick={this.handleClick} >
        {text}
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
