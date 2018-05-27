import React, { Component } from "react";

import { Betoken } from "./objects/betoken.js";

import { getbetoken_addr } from "./body";

class MyAccount extends Component {
  render() {
    return (
      <div>
        <p>Hello1</p>
        <p>{getbetoken_addr()}</p>
        <p>Hello2</p>
      </div>
    );
  }
}
export default MyAccount;
