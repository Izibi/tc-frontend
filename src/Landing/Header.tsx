
import * as React from 'react';
import {User} from '../types';

type Props = {
  user?: User
}

const Header : React.StatelessComponent<Props> = ({user}) =>
  <div>
    <div className="landingTitle">
      {"Tezos Contests"}
    </div>
    {user &&
       <p>
         {"Hello, "}{user.firstname}{" "}{user.lastname}
       </p>}
  </div>;

export default Header;
