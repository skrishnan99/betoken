// Generated by CoffeeScript 2.1.0
var Web3, avgROI, betoken, betoken_addr, chart, clock, commissionRate, countdownDay, countdownHour, countdownMin, countdownSec, cycleNumber, cyclePhase, displayedKairoBalance, displayedKairoUnit, etherDelta_addr, kairoBalance, kairoTotalSupply, kairo_addr, loadFundData, memberList, networkName, prevCommission, prevROI, proposalList, showCountdown, showTransaction, startTimeOfCycle, supportedProposalList, timeOfChangeMaking, timeOfCycle, timeOfProposalMaking, totalCommission, totalFunds, transactionHash, transactionHistory, userAddress, userBalance, web3;

import './body.html';

import './body.css';

import './tablesort.js';

import {
  Betoken
} from '../objects/betoken.js';

import Chart from 'chart.js';

import BigNumber from 'bignumber.js';

//Import web3
Web3 = require('web3');

web3 = window.web3;

if (typeof web3 !== void 0) {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

//Fund object
betoken_addr = new ReactiveVar("0xfbcd2ce367bf3cc755b3ccbae7bbe2df1b9590f7");

betoken = new Betoken(betoken_addr.get());

//Session data
userAddress = new ReactiveVar("");

userBalance = new ReactiveVar(BigNumber(0));

kairoBalance = new ReactiveVar(BigNumber(0));

kairoTotalSupply = new ReactiveVar(BigNumber(0));

cyclePhase = new ReactiveVar(0);

startTimeOfCycle = new ReactiveVar(0);

timeOfCycle = new ReactiveVar(0);

timeOfChangeMaking = new ReactiveVar(0);

timeOfProposalMaking = new ReactiveVar(0);

totalFunds = new ReactiveVar(BigNumber(0));

proposalList = new ReactiveVar([]);

supportedProposalList = new ReactiveVar([]);

memberList = new ReactiveVar([]);

cycleNumber = new ReactiveVar(0);

commissionRate = new ReactiveVar(BigNumber(0));

//Displayed variables
kairo_addr = new ReactiveVar("");

etherDelta_addr = new ReactiveVar("");

displayedKairoBalance = new ReactiveVar(BigNumber(0));

displayedKairoUnit = new ReactiveVar("KRO");

countdownDay = new ReactiveVar(0);

countdownHour = new ReactiveVar(0);

countdownMin = new ReactiveVar(0);

countdownSec = new ReactiveVar(0);

showCountdown = new ReactiveVar(true);

transactionHash = new ReactiveVar("");

networkName = new ReactiveVar("");

chart = null;

prevROI = new ReactiveVar(BigNumber(0));

avgROI = new ReactiveVar(BigNumber(0));

prevCommission = new ReactiveVar(BigNumber(0));

totalCommission = new ReactiveVar(BigNumber(0));

transactionHistory = new ReactiveVar([]);

showTransaction = function(_transaction) {
  transactionHash.set(_transaction.transactionHash);
  $('#transaction_sent_modal').modal('show');
};

clock = function() {
  return setInterval(function() {
    var days, distance, hours, minutes, now, seconds, target;
    now = Math.floor(new Date().getTime() / 1000);
    target = 0;
    switch (cyclePhase.get()) {
      case 0:
        target = startTimeOfCycle.get() + timeOfChangeMaking.get();
        break;
      case 1:
        target = startTimeOfCycle.get() + timeOfChangeMaking.get() + timeOfProposalMaking.get();
        break;
      case 2:
        target = startTimeOfCycle.get() + timeOfCycle.get();
    }
    distance = target - now;
    if (distance > 0) {
      showCountdown.set(true);
      days = Math.floor(distance / (60 * 60 * 24));
      hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60));
      minutes = Math.floor((distance % (60 * 60)) / 60);
      seconds = Math.floor(distance % 60);
      countdownDay.set(days);
      countdownHour.set(hours);
      countdownMin.set(minutes);
      return countdownSec.set(seconds);
    } else {
      return showCountdown.set(false);
    }
  }, 1000);
};

loadFundData = function() {
  var members, proposals, receivedROICount, supportedProposals;
  proposals = [];
  supportedProposals = [];
  members = [];
  receivedROICount = 0;
  web3.eth.getAccounts().then(function(accounts) {
    return web3.eth.defaultAccount = accounts[0];
  }).then(function() {
    return web3.eth.defaultAccount;
  }).then(function(_userAddress) {
    //Initialize user address
    userAddress.set(_userAddress);
    betoken.getMappingOrArrayItem("balanceOf", _userAddress).then(function(_balance) {
      //Get user Ether deposit balance
      return userBalance.set(BigNumber(web3.utils.fromWei(_balance, "ether")).toFormat(18));
    });
    betoken.getKairoBalance(_userAddress).then(function(_kairoBalance) {
      //Get user's Kairo balance
      kairoBalance.set(BigNumber(_kairoBalance));
      return displayedKairoBalance.set(BigNumber(web3.utils.fromWei(_kairoBalance, "ether")).toFormat(18));
    });
    //Listen for transactions
    betoken.contracts.groupFund.getPastEvents("Deposit", {
      fromBlock: 0
    }).then(function(_events) {
      var _event, data, j, len, results, tmp;
      results = [];
      for (j = 0, len = _events.length; j < len; j++) {
        _event = _events[j];
        data = _event.returnValues;
        if (data._sender === _userAddress) {
          tmp = transactionHistory.get();
          tmp.push({
            type: "Deposit",
            amount: BigNumber(data._amountInWeis).div(1e18).toFormat(4),
            timestamp: new Date(+data._timestamp * 1e3).toString()
          });
          results.push(transactionHistory.set(tmp));
        } else {
          results.push(void 0);
        }
      }
      return results;
    });
    return betoken.contracts.groupFund.getPastEvents("Withdraw", {
      fromBlock: 0
    }).then(function(_events) {
      var _event, data, j, len, results, tmp;
      results = [];
      for (j = 0, len = _events.length; j < len; j++) {
        _event = _events[j];
        data = _event.returnValues;
        if (data._sender === _userAddress) {
          tmp = transactionHistory.get();
          tmp.push({
            type: "Withdraw",
            amount: BigNumber(data._amountInWeis).div(1e18).toFormat(4),
            timestamp: new Date(+data._timestamp * 1e3).toString()
          });
          results.push(transactionHistory.set(tmp));
        } else {
          results.push(void 0);
        }
      }
      return results;
    });
  });
  //Get cycle data
  betoken.getPrimitiveVar("cyclePhase").then(function(_cyclePhase) {
    return cyclePhase.set(+_cyclePhase);
  });
  betoken.getPrimitiveVar("startTimeOfCycle").then(function(_startTime) {
    return startTimeOfCycle.set(+_startTime);
  });
  betoken.getPrimitiveVar("timeOfCycle").then(function(_time) {
    return timeOfCycle.set(+_time);
  });
  betoken.getPrimitiveVar("timeOfChangeMaking").then(function(_time) {
    return timeOfChangeMaking.set(+_time);
  });
  betoken.getPrimitiveVar("timeOfProposalMaking").then(function(_time) {
    return timeOfProposalMaking.set(+_time);
  });
  betoken.getPrimitiveVar("commissionRate").then(function(_result) {
    return commissionRate.set(BigNumber(_result).div(1e18));
  });
  //Get contract addresses
  kairo_addr.set(betoken.addrs.controlToken);
  betoken.getPrimitiveVar("etherDeltaAddr").then(function(_etherDeltaAddr) {
    return etherDelta_addr.set(_etherDeltaAddr);
  });
  //Get Network ID
  web3.eth.net.getId().then(function(_id) {
    var net;
    switch (_id) {
      case 1:
        net = "Main Ethereum Network";
        break;
      case 3:
        net = "Ropsten Testnet";
        break;
      case 4:
        net = "Rinkeby Testnet";
        break;
      case 42:
        net = "Kovan Testnet";
        break;
      default:
        net = "Unknown Network";
    }
    networkName.set(net);
  });
  //Get statistics
  betoken.getPrimitiveVar("cycleNumber").then(function(_result) {
    return cycleNumber.set(+_result);
  }).then(function() {
    chart.data.datasets[0].data = [];
    betoken.contracts.groupFund.getPastEvents("ROI", {
      fromBlock: 0
    }).then(function(_events) {
      var ROI, _event, data, j, len, results;
      results = [];
      for (j = 0, len = _events.length; j < len; j++) {
        _event = _events[j];
        data = _event.returnValues;
        ROI = BigNumber(data._afterTotalFunds).minus(data._beforeTotalFunds).div(data._afterTotalFunds).mul(100);
        //Update chart data
        chart.data.datasets[0].data.push({
          x: data._cycleNumber,
          y: ROI.toString()
        });
        chart.update();
        //Update previous cycle ROI
        if (+data._cycleNumber === cycleNumber.get() - 1) {
          prevROI.set(ROI);
        }
        //Update average ROI
        receivedROICount += 1;
        results.push(avgROI.set(avgROI.get().add(ROI.minus(avgROI.get()).div(receivedROICount))));
      }
      return results;
    });
    //Example data
    /*chart.data.datasets[0].data = [
      x: "1"
      y: "10"
    ,
      x: "2"
      y: "13"
    ,
      x: "3"
      y: "20"
    ]
    chart.update()*/
    return betoken.contracts.groupFund.getPastEvents("CommissionPaid", {
      fromBlock: 0
    }).then(function(_events) {
      var _event, commission, j, len, results;
      results = [];
      for (j = 0, len = _events.length; j < len; j++) {
        _event = _events[j];
        commission = BigNumber(_event.returnValues._totalCommissionInWeis);
        //Update previous cycle commission
        if (+data._cycleNumber === cycleNumber.get() - 1) {
          prevCommission.set(commission);
        }
        //Update total commission
        results.push(totalCommission.set(totalCommission.get().add(commission)));
      }
      return results;
    });
  });
  //Get proposals & participants
  Promise.all([
    betoken.getKairoTotalSupply().then(function(_kairoTotalSupply) {
      //Get Kairo's total supply
      kairoTotalSupply.set(BigNumber(_kairoTotalSupply));
    }),
    //Get total funds
    betoken.getPrimitiveVar("totalFundsInWeis").then(function(_totalFunds) {
      return totalFunds.set(BigNumber(_totalFunds));
    })
  ]).then(function() {
    return Promise.all([
      betoken.getArray("proposals").then(function(_proposals) {
        var allPromises,
      getProposal,
      i;
        allPromises = [];
        if (_proposals.length > 0) {
          getProposal = function(i) {
            if (_proposals[i].numFor > 0) {
              return betoken.getMappingOrArrayItem("forStakedControlOfProposal",
      i).then(function(_stake) {
                var investment,
      proposal;
                investment = BigNumber(_stake).dividedBy(kairoTotalSupply.get()).times(web3.utils.fromWei(totalFunds.get().toString()));
                proposal = {
                  id: i,
                  token_symbol: _proposals[i].tokenSymbol,
                  investment: investment.toFormat(4),
                  supporters: _proposals[i].numFor
                };
                return proposals.push(proposal);
              });
            }
          };
          allPromises = (function() {
            var j,
      ref,
      results;
            results = [];
            for (i = j = 0, ref = _proposals.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
              results.push(getProposal(i));
            }
            return results;
          })();
        }
        return Promise.all(allPromises);
      }).then(function() {
        proposalList.set(proposals);
      }).then(function() {
        var allPromises,
      filterProposal,
      proposal;
        //Filter out proposals the user supported
        allPromises = [];
        filterProposal = function(proposal) {
          return betoken.getDoubleMapping("forStakedControlOfProposalOfUser",
      proposal.id,
      userAddress.get()).then(function(_stake) {
            _stake = BigNumber(web3.utils.fromWei(_stake));
            if (_stake.greaterThan(0)) {
              proposal.user_stake = _stake;
              return supportedProposals.push(proposal);
            }
          });
        };
        allPromises = (function() {
          var j,
      len,
      ref,
      results;
          ref = proposalList.get();
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            proposal = ref[j];
            results.push(filterProposal(proposal));
          }
          return results;
        })();
        return Promise.all(allPromises);
      }).then(function() {
        supportedProposalList.set(supportedProposals);
      }),
      betoken.getArray("participants").then(function(_array) {
        var i,
      j,
      ref;
        //Get member addresses
        members = new Array(_array.length);
        if (_array.length > 0) {
          for (i = j = 0, ref = _array.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
            members[i] = new Object();
            members[i].address = _array[i];
          }
        }
      }).then(function() {
        var allPromises,
      i,
      setBalance;
        //Get member ETH balances
        if (members.length > 0) {
          setBalance = function(id) {
            return betoken.getMappingOrArrayItem("balanceOf",
      members[id].address).then(function(_eth_balance) {
              members[id].eth_balance = BigNumber(web3.utils.fromWei(_eth_balance,
      "ether")).toFormat(4);
            });
          };
          allPromises = (function() {
            var j,
      ref,
      results;
            results = [];
            for (i = j = 0, ref = members.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
              results.push(setBalance(i));
            }
            return results;
          })();
          return Promise.all(allPromises);
        }
      }).then(function() {
        var allPromises,
      i,
      setBalance;
        //Get member KRO balances
        if (members.length > 0) {
          setBalance = function(id) {
            return betoken.getKairoBalance(members[id].address).then(function(_kro_balance) {
              members[id].kro_balance = BigNumber(web3.utils.fromWei(_kro_balance,
      "ether")).toFormat(4);
            });
          };
          allPromises = (function() {
            var j,
      ref,
      results;
            results = [];
            for (i = j = 0, ref = members.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
              results.push(setBalance(i));
            }
            return results;
          })();
          return Promise.all(allPromises);
        }
      }).then(function() {
        var j,
      len,
      member;
        //Get member KRO proportions
        for (j = 0, len = members.length; j < len; j++) {
          member = members[j];
          member.kro_proportion = BigNumber(member.kro_balance).dividedBy(web3.utils.fromWei(kairoTotalSupply.get().toString())).times(100).toPrecision(4);
        }
      }).then(function() {
        //Update reactive_list
        return memberList.set(members);
      })
    ]);
  });
};

$('document').ready(function() {
  $('.menu .item').tab();
  $('table').tablesort();
  clock();
  chart = new Chart($("#myChart"), {
    type: 'line',
    data: {
      datasets: [
        {
          label: "ROI Per Cycle",
          backgroundColor: 'rgba(0, 0, 100, 0.5)',
          borderColor: 'rgba(0, 0, 100, 1)',
          data: []
        }
      ]
    },
    options: {
      scales: {
        xAxes: [
          {
            type: 'linear',
            position: 'bottom',
            scaleLabel: {
              display: true,
              labelString: 'Investment Cycle'
            },
            ticks: {
              stepSize: 1
            }
          }
        ],
        yAxes: [
          {
            type: 'linear',
            position: 'left',
            scaleLabel: {
              display: true,
              labelString: 'Percent'
            },
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    }
  });
  //Initialize Betoken object
  return betoken.init().then(loadFundData);
});

Template.body.helpers({
  transaction_hash: function() {
    return transactionHash.get();
  }
});

Template.top_bar.helpers({
  show_countdown: function() {
    return showCountdown.get();
  },
  betoken_addr: function() {
    return betoken_addr.get();
  },
  kairo_addr: function() {
    return kairo_addr.get();
  },
  etherdelta_addr: function() {
    return etherDelta_addr.get();
  }
});

Template.top_bar.events({
  "click .next_phase": function(event) {
    return betoken.endPhase().then(showTransaction);
  },
  "click .change_contract": function(event) {
    return $('#change_contract_modal').modal({
      onApprove: function(e) {
        var error, new_addr;
        try {
          new_addr = $("#contract_addr_input")[0].value;
          betoken_addr.set(new_addr);
          betoken = new Betoken(betoken_addr.get());
          return loadFundData();
        } catch (error1) {
          error = error1;
        }
      }
    //Todo:Display error message
    }).modal('show');
  },
  "click .refresh_button": function(event) {
    return loadFundData();
  }
});

Template.countdown_timer.helpers({
  day: function() {
    return countdownDay.get();
  },
  hour: function() {
    return countdownHour.get();
  },
  minute: function() {
    return countdownMin.get();
  },
  second: function() {
    return countdownSec.get();
  }
});

Template.phase_indicator.helpers({
  phase_active: function(index) {
    if (cyclePhase.get() === index) {
      return "active";
    }
    return "";
  }
});

Template.sidebar.helpers({
  network_name: function() {
    return networkName.get();
  },
  user_address: function() {
    return userAddress.get();
  },
  user_balance: function() {
    return userBalance.get();
  },
  user_kairo_balance: function() {
    return displayedKairoBalance.get();
  },
  kairo_unit: function() {
    return displayedKairoUnit.get();
  },
  expected_commission: function() {
    if (kairoTotalSupply.get().greaterThan(0)) {
      return kairoBalance.get().div(kairoTotalSupply.get()).mul(totalFunds.get().div(1e18)).mul(avgROI.get().add(100).div(100)).mul(commissionRate.get()).toFormat(18);
    }
    return BigNumber(0).toFormat(18);
  }
});

Template.sidebar.events({
  "click .kairo_unit_switch": function(event) {
    if (event.target.checked) {
      //Display proportion
      displayedKairoBalance.set(kairoBalance.get().dividedBy(kairoTotalSupply.get()).times("100").toFormat(18));
      return displayedKairoUnit.set("%");
    } else {
      //Display Kairo
      displayedKairoBalance.set(BigNumber(web3.utils.fromWei(kairoBalance.get().toString(), "ether")).toFormat(18));
      return displayedKairoUnit.set("KRO");
    }
  }
});

Template.transact_box.onCreated(function() {
  Template.instance().depositInputHasError = new ReactiveVar(false);
  return Template.instance().withdrawInputHasError = new ReactiveVar(false);
});

Template.transact_box.helpers({
  is_disabled: function() {
    if (cyclePhase.get() !== 0) {
      return "disabled";
    }
    return "";
  },
  has_error: function(input_id) {
    if (input_id === 0) {
      if (Template.instance().depositInputHasError.get()) {
        return "error";
      }
    } else {
      if (Template.instance().withdrawInputHasError.get()) {
        return "error";
      }
    }
    return "";
  },
  transaction_history: function() {
    return transactionHistory.get();
  }
});

Template.transact_box.events({
  "click .deposit_button": function(event) {
    var amount;
    try {
      Template.instance().depositInputHasError.set(false);
      amount = BigNumber(web3.utils.toWei($("#deposit_input")[0].value));
      return betoken.deposit(amount).then(showTransaction);
    } catch (error1) {
      return Template.instance().depositInputHasError.set(true);
    }
  },
  "click .withdraw_button": function(event) {
    var amount;
    try {
      Template.instance().withdrawInputHasError.set(false);
      amount = BigNumber(web3.utils.toWei($("#withdraw_input")[0].value));
      return betoken.withdraw(amount).then(showTransaction);
    } catch (error1) {
      return Template.instance().withdrawInputHasError.set(true);
    }
  }
});

Template.supported_props_box.helpers({
  proposal_list: function() {
    return supportedProposalList.get();
  },
  is_disabled: function() {
    if (cyclePhase.get() !== 1) {
      return "disabled";
    }
    return "";
  }
});

Template.supported_props_box.events({
  "click .cancel_support_button": function(event) {
    return betoken.cancelSupport(this.id).then(showTransaction);
  }
});

Template.stats_tab.helpers({
  member_count: function() {
    return memberList.get().length;
  },
  cycle_length: function() {
    return BigNumber(timeOfCycle.get()).div(24 * 60 * 60).toDigits(3);
  },
  total_funds: function() {
    return totalFunds.get().div("1e18").toFormat(2);
  },
  prev_roi: function() {
    return prevROI.get().toFormat(2);
  },
  avg_roi: function() {
    return avgROI.get().toFormat(2);
  },
  prev_commission: function() {
    return prevCommission.get().div(1e18).toFormat(2);
  },
  historical_commission: function() {
    return totalCommission.get().div(1e18).toFormat(2);
  }
});

Template.proposals_tab.helpers({
  proposal_list: function() {
    return proposalList.get();
  },
  is_disabled: function() {
    if (cyclePhase.get() !== 1) {
      return "disabled";
    }
    return "";
  }
});

Template.proposals_tab.events({
  "click .support_proposal": function(event) {
    var id;
    id = this.id;
    return $('#support_proposal_modal_' + id).modal({
      onApprove: function(e) {
        var error, kairoAmountInWeis;
        try {
          kairoAmountInWeis = BigNumber($("#stake_input_" + id)[0].value).times("1e18");
          return betoken.supportProposal(id, kairoAmountInWeis).then(showTransaction);
        } catch (error1) {
          error = error1;
          //Todo:Display error message
          return console.log(error);
        }
      }
    }).modal('show');
  },
  "click .new_proposal": function(event) {
    return $('#new_proposal_modal').modal({
      onApprove: function(e) {
        var address, error, kairoAmountInWeis, tickerSymbol;
        try {
          address = $("#address_input_new")[0].value;
          tickerSymbol = $("#ticker_input_new")[0].value;
          kairoAmountInWeis = BigNumber($("#stake_input_new")[0].value).times("1e18");
          return betoken.createProposal(address, tickerSymbol, kairoAmountInWeis).then(showTransaction);
        } catch (error1) {
          error = error1;
        }
      }
    //Todo:Display error message
    }).modal('show');
  }
});

Template.members_tab.helpers({
  member_list: function() {
    return memberList.get();
  }
});

//# sourceMappingURL=body.js.map
