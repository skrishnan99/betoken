loadFundData = async function() {
  var ROI,
    _event,
    commission,
    data,
    events,
    getDepositWithdrawHistory,
    getTransferHistory,
    handleAllProposals,
    handleProposal,
    i,
    investments,
    j,
    k,
    len,
    len1,
    net,
    netID,
    pre,
    receivedROICount,
    tmp,
    userAddr;
  investments = [];
  receivedROICount = 0;
  // Get Network ID
  netID = await web3.eth.net.getId();
  switch (netID) {
    case 1:
      net = "Main Ethereum Network";
      pre = "";
      break;
    case 3:
      net = "Ropsten Testnet";
      pre = "ropsten.";
      break;
    case 4:
      net = "Rinkeby Testnet";
      pre = "rinkeby.";
      break;
    case 42:
      net = "Kovan Testnet";
      pre = "kovan.";
      break;
    default:
      net = "Unknown Network";
      pre = "";
  }
  networkName.set(net);
  networkPrefix.set(pre);
  if (netID !== 4) {
    showError("Please switch to Rinkeby Testnet in order to try Betoken Alpha");
  }
  if (!hasWeb3) {
    showError(NO_WEB3_ERR);
  }
  /*
     * Get fund data
     */
  cycleNumber.set(+(await betoken.getPrimitiveVar("cycleNumber")));
  cyclePhase.set(+(await betoken.getPrimitiveVar("cyclePhase")));
  startTimeOfCyclePhase.set(
    +(await betoken.getPrimitiveVar("startTimeOfCyclePhase"))
  );
  phaseLengths.set(
    (await betoken.getPrimitiveVar("getPhaseLengths")).map(function(x) {
      return +x;
    })
  );
  commissionRate.set(
    BigNumber(await betoken.getPrimitiveVar("commissionRate")).div(1e18)
  );
  paused.set(await betoken.getPrimitiveVar("paused"));
  allowEmergencyWithdraw.set(
    await betoken.getPrimitiveVar("allowEmergencyWithdraw")
  );
  cycleTotalCommission.set(
    BigNumber(await betoken.getPrimitiveVar("totalCommission"))
  );
  assetFeeRate.set(BigNumber(await betoken.getPrimitiveVar("assetFeeRate")));
  sharesTotalSupply.set(BigNumber(await betoken.getShareTotalSupply()));
  totalFunds.set(BigNumber(await betoken.getPrimitiveVar("totalFundsInDAI")));
  kairoTotalSupply.set(BigNumber(await betoken.getKairoTotalSupply()));
  // Get contract addresses
  kairoAddr.set(betoken.addrs.controlToken);
  sharesAddr.set(betoken.addrs.shareToken);
  kyberAddr.set(await betoken.getPrimitiveVar("kyberAddr"));
  daiAddr.set(await betoken.getPrimitiveVar("daiAddr"));
  tmp = tokenAddresses.get();
  tmp["DAI"] = daiAddr.get();
  tokenAddresses.set(tmp);
  // Get statistics
  prevROI.set(BigNumber(0));
  avgROI.set(BigNumber(0));
  prevCommission.set(BigNumber(0));
  historicalTotalCommission.set(BigNumber(0));
  // Get commission
  events = await betoken.contracts.betokenFund.getPastEvents(
    "TotalCommissionPaid",
    {
      fromBlock: 0
    }
  );
  for (j = 0, len = events.length; j < len; j++) {
    _event = events[j];
    data = _event.returnValues;
    commission = BigNumber(data._totalCommissionInWeis);
    // Update previous cycle commission
    if (+data._cycleNumber === cycleNumber.get() - 1) {
      prevCommission.set(commission);
    }
    // Update total commission
    historicalTotalCommission.set(
      historicalTotalCommission.get().add(commission)
    );
  }
  // Draw chart
  chart.data.datasets[0].data = [];
  chart.update();
  events = await betoken.contracts.betokenFund.getPastEvents("ROI", {
    fromBlock: 0
  });
  for (k = 0, len1 = events.length; k < len1; k++) {
    _event = events[k];
    data = _event.returnValues;
    ROI = BigNumber(data._afterTotalFunds)
      .minus(data._beforeTotalFunds)
      .div(data._afterTotalFunds)
      .mul(100);
    // Update chart data
    chart.data.datasets[0].data.push({
      x: data._cycleNumber,
      y: ROI.toString()
    });
    chart.update();
    // Update previous cycle ROI
    if (
      +data._cycleNumber === cycleNumber.get() ||
      +data._cycleNumber === cycleNumber.get() - 1
    ) {
      prevROI.set(ROI);
    }
    // Update average ROI
    receivedROICount += 1;
    avgROI.set(avgROI.get().add(ROI.minus(avgROI.get()).div(receivedROICount)));
  }
  /*
     * Get user related data
     */
  if (hasWeb3) {
    // Get user address
    userAddr = (await web3.eth.getAccounts())[0];
    web3.eth.defaultAccount = userAddr;
    if (userAddr != null) {
      userAddress.set(userAddr);
    }
    // Get shares balance
    sharesBalance.set(BigNumber(await betoken.getShareBalance(userAddr)));
    if (!sharesTotalSupply.get().isZero()) {
      displayedInvestmentBalance.set(
        sharesBalance
          .get()
          .div(sharesTotalSupply.get())
          .mul(totalFunds.get())
          .div(1e18)
      );
    }
    // Get user's Kairo balance
    kairoBalance.set(BigNumber(await betoken.getKairoBalance(userAddr)));
    displayedKairoBalance.set(kairoBalance.get().div(1e18));
    // Get last commission redemption cycle number
    lastCommissionRedemption.set(
      +(await betoken.getMappingOrArrayItem(
        "lastCommissionRedemption",
        userAddr
      ))
    );
    // Get list of user's investments
    investments = await betoken.getInvestments(userAddress.get());
    if (investments.length !== 0) {
      handleProposal = function(id) {
        return betoken
          .getTokenSymbol(investments[id].tokenAddress)
          .then(function(_symbol) {
            investments[id].id = id;
            investments[id].tokenSymbol = _symbol;
            investments[id].investment = BigNumber(investments[id].stake)
              .div(kairoTotalSupply.get())
              .mul(totalFunds.get())
              .div(1e18)
              .toFormat(4);
            investments[id].ROI = investments[id].isSold
              ? BigNumber(investments[id].sellPrice)
                  .sub(investments[id].buyPrice)
                  .div(investments[id].buyPrice)
                  .toFormat(4)
              : "N/A";
            investments[id].kroChange = investments[id].isSold
              ? BigNumber(investments[id].ROI)
                  .mul(investments[id].stake)
                  .div(1e18)
                  .toFormat(4)
              : "N/A";
            return (investments[id].stake = BigNumber(investments[id].stake)
              .div(1e18)
              .toFormat(4));
          });
      };
      handleAllProposals = (function() {
        var l, ref, results;
        results = [];
        for (
          i = l = 0, ref = investments.length - 1;
          0 <= ref ? l <= ref : l >= ref;
          i = 0 <= ref ? ++l : --l
        ) {
          results.push(handleProposal(i));
        }
        return results;
      })();
      await Promise.all(handleAllProposals);
      investmentList.set(investments);
    }
    // Get deposit and withdraw history
    transactionHistory.set([]);
    getDepositWithdrawHistory = async function(_type) {
      var entry, event, l, len2, results;
      events = await betoken.contracts.betokenFund.getPastEvents(_type, {
        fromBlock: 0,
        filter: {
          _sender: userAddr
        }
      });
      results = [];
      for (l = 0, len2 = events.length; l < len2; l++) {
        event = events[l];
        data = event.returnValues;
        entry = {
          type: _type,
          timestamp: new Date(+data._timestamp * 1e3).toString(),
          token: await betoken.getTokenSymbol(data._tokenAddress),
          amount: BigNumber(data._tokenAmount)
            .div(10 ** +(await betoken.getTokenDecimals(data._tokenAddress)))
            .toFormat(4)
        };
        tmp = transactionHistory.get();
        tmp.push(entry);
        results.push(transactionHistory.set(tmp));
      }
      return results;
    };
    getDepositWithdrawHistory("Deposit");
    getDepositWithdrawHistory("Withdraw");
    // Get token transfer history
    getTransferHistory = async function(token, isIn) {
      var entry, l, len2, results, tokenContract;
      tokenContract = (function() {
        switch (token) {
          case "KRO":
            return betoken.contracts.controlToken;
          case "BTKS":
            return betoken.contracts.shareToken;
          default:
            return null;
        }
      })();
      events = await tokenContract.getPastEvents("Transfer", {
        fromBlock: 0,
        filter: !isIn
          ? {
              from: userAddr
            }
          : {
              to: userAddr
            }
      });
      results = [];
      for (l = 0, len2 = events.length; l < len2; l++) {
        _event = events[l];
        data = _event.returnValues;
        entry = {
          type: "Transfer " + (isIn ? "In" : "Out"),
          token: token,
          amount: BigNumber(data.value)
            .div(1e18)
            .toFormat(4),
          timestamp: new Date(
            (await web3.eth.getBlock(_event.blockNumber)).timestamp * 1e3
          ).toString()
        };
        tmp = transactionHistory.get();
        tmp.push(entry);
        results.push(transactionHistory.set(tmp));
      }
      return results;
    };
    getTransferHistory("KRO", true);
    getTransferHistory("KRO", false);
    getTransferHistory("BTKS", true);
    getTransferHistory("BTKS", false);
  }
};
