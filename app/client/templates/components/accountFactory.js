/**
Template Controller

@module Templates
*/

/**
The template to allow easy WeiFund contract deployment.

@class [template] components_weihash
@constructor
*/

var template;

Template['components_accountFactory'].created = function() {
  TemplateVar.set('deployAccountsState', {
    isUndeployed: true
  });
};

Template['components_accountFactory'].rendered = function() {
  template = this;
};

Template['components_accountFactory'].helpers({
  'gasAmount': function() {
    return web3.eth.defaultGas;
  },
  'estimateGas': function() {
    return 1906742;
  },
  'weifundAddress': function() {
    return objects.contracts.WeiFund.address;
  },
});

Template['components_accountFactory'].events({
  /**
  Deploy the WeiHash contract.

  @event (click #weifundDeploy)
  **/

  'click #deployCampaignAccountFactory': function(event, template) {
    if (!confirm("Are you sure you want to deploy a WeiHash contract?"))
      return;

    // set new WeiFund address and TX object
    var weifundAddress = objects.contracts.WeiFund.address,
      transactionObject = {
        data: '0x' + CampaignAccountFactory.bytecode,
        gas: web3.eth.defaultGas,
        from: web3.eth.defaultAccount
      };

    // create new CampaignAccountFactory contract
    CampaignAccountFactory.new(weifundAddress, transactionObject, function(err, result) {
      if (err)
        return TemplateVar.set(template, 'deployAccountsState', {
          isError: true,
          error: err
        });

      // set state as mining
      TemplateVar.set(template, 'deployAccountsState', {
        isMining: true,
        transactionHash: result.transactionHash
      });

      // set state as mined
      if (result.address) {
        TemplateVar.set(template, 'deployAccountsState', {
          isMined: true,
          address: result.address,
          transactionHash: result.transactionHash
        });

        // get/set contracts object
        var contractsObject = LocalStore.get('contracts');
        contractsObject[LocalStore.get('network')]['CampaignAccountFactory'] = result.address;

        // Update the CampaignAccountFactory address
        LocalStore.set('contracts', contractsObject);
      }
    });

    // Prevent Double Click
    $(event.currentTarget).prop('disabled', true);
  },

  /**
  Register a hash with WeiHash.

  @event (click #weihashRegister)
  **/

  'click #newAccount': function(event, template) {
    // set campaign ID,
    var campaignID = Helpers.cleanAscii($('#newAccountCampaignID').val()),
      transactionObject = {
        from: web3.eth.defaultAccount,
        gas: web3.eth.defaultGas
      },
      filterObject = {
        _campaignID: campaignID,
      };

    objects.contracts.WeiFund.isSuccess(campaignID, function(err, result) {
      console.log('success', result);
    });
    objects.contracts.WeiFund.hasFailed(campaignID, function(err, result) {
      console.log('failed', result);
    });
    objects.contracts.WeiFund.isPaidOut(campaignID, function(err, result) {
      console.log('paidout', result);
    });
    objects.contracts.WeiFund.isOwner(campaignID, transactionObject.from, function(err, result) {
      console.log('owner', result);
    });

    if (!confirm("Are you sure you want to register this hash with WeiHash?"))
      return;

    // Prevent Double Click
    $(event.currentTarget).prop('disabled', true);

    objects.contracts.CampaignAccountFactory.newCampaignAccount(campaignID, transactionObject, function(err, result) {
      if (err)
        return TemplateVar.set(template, 'newAccountState', {
          isError: true,
          error: err
        });

      // set new account state
      TemplateVar.set(template, 'newAccountState', {
        isMining: true,
        transactionHash: result
      });
    });

    objects.contracts.CampaignAccountFactory.AccountRegistered({
      _campaignID: campaignID
    }, function(err, result) {
      if (err)
        return TemplateVar.set(template, 'newAccountState', {
          isError: true,
          error: err
        });

      if (result)
        TemplateVar.set(template, 'newAccountState', {
          isMined: true,
          address: result.args._account,
          transactionHash: result.transactionHash
        });
    });
  },

  /**
  Lookup a hash on the WeiHash registery.

  @event (click #weihashLookup)
  **/

  'click #lookupAccount': function(event, template) {
    var campaignID = Helpers.cleanAscii($('#lookupAccountCampaignID').val());

    objects.contracts.CampaignAccountFactory.accountOf(campaignID, function(err, result) {
      if (err)
        return TemplateVar.set(template, 'lookupAccountState', {
          isError: true,
          error: err
        });

      TemplateVar.set(template, 'lookupAccountState', {
        isSuccess: true,
        campaignID: campaignID,
        address: result
      });
    });
  },
});
