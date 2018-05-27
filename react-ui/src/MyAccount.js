import React, { Component } from "react";

import { Betoken } from "./objects/betoken.js";

import {
  networkName,
  userAddress,
  displayedInvestmentBalance,
  displayedInvestmentUnit,
  displayedKairoBalance,
  displayedKairoUnit,
  expected_commission
} from "./body";

class MyAccount extends Component {
  render() {
    return (
      <div>
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

          <div class="ui item">
            <div class="ui horizontal divider">Investment Balance</div>

            <div class="ui grid stackable">
              <div class="ui container ten wide column">
                <div class="ui mini horizontal statistic">
                  <div class="value copyable">
                    {displayedInvestmentBalance.get().toFormat(18)}
                  </div>
                  <div class="label">{displayedInvestmentUnit.get()}</div>
                </div>
              </div>

              <div class="ui container six wide column">
                <div class="ui slider checkbox" />
              </div>
            </div>
          </div>

          <div class="ui item">
            <div class="ui horizontal divider">Kairo Balance</div>

            <div class="ui grid stackable">
              <div class="ui container ten wide column">
                <div class="ui mini horizontal statistic">
                  <div class="value copyable">
                    {displayedKairoBalance.get().toFormat(18)}
                  </div>
                  <div class="label">{displayedKairoUnit.get()}</div>
                </div>
              </div>

              <div class="ui container six wide column">
                <div class="ui slider checkbox" />
              </div>
            </div>
          </div>
          <div class="ui item">
            <div class="ui horizontal divider">Expected Commission</div>
            <div class="ui mini horizontal statistic">
              <div class="value copyable">{expected_commission()}</div>
              <div class="label">DAI</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default MyAccount;
