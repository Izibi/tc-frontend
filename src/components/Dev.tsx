
import * as React from 'react';

const Dev : React.StatelessComponent<{}> = ({children}) =>
  process.env.NODE_ENV === "production" ? null : <div>{children}</div>;

export default Dev;
