
import * as React from 'react';
import {Button} from "@blueprintjs/core";
import {User} from '../types';

type Props = {
  user?: User
}

const Header : React.StatelessComponent<Props> = ({user}) =>
  <div className="landingHeader">
    <div className="landingTitle">
      {"Tezos Contests"}
    </div>
    {user &&
       <Button>
         {"Hello, "}{user.firstname}{" "}{user.lastname}
       </Button>}
  </div>;

export default Header;
