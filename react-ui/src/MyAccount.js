import React, { Component } from "react";

import { Betoken } from "./objects/betoken.js";

import { betoken_addr, networkName, userAddress } from "./body";

class MyAccount extends Component {
  render() {
    return (
      <div>
        <p>betoken_addr</p>
        <p>{betoken_addr.get()}</p>

        <div class="row">
          <h2>My Account</h2>
          <div class="ui menu vertical fluid">
            <div class="ui item">
              <div class="ui horizontal divider">Current Network</div>
              <h4>{networkName.get()}</h4>
            </div>
            <div class="ui item">
              <div class="ui horizontal divider">Address</div>
              <h5 class="copyable">{userAddress.get()}</h5>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default MyAccount;
