
import * as React from 'react';
import {User} from '../types';

type IProps = {
  user?: User
}

const Header : React.StatelessComponent<IProps> = ({user}) =>
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
