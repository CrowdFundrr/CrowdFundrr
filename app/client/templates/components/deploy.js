/**
Template Controller

@module Templates
*/

/**
The template to allow easy WeiFund contract deployment.

@class [template] components_deploy
@constructor
*/

Template['components_deploy'].created = function() {
  TemplateVar.set('state', {
    isUndeployed: true
  });
};

Template['components_deploy'].rendered = function() {
  var template = this;
};


Template['components_deploy'].helpers({
  'gasAmount': function() {
    return web3.eth.defaultGas;
  },
  'estimateGas': function() {
    return 1906742;
  },
});

Template['components_deploy'].events({
  /**
  Deploy the price feed, used for setup of contract.

  @event (click #weifundDeploy)
  **/

  'click #weifundDeploy': function(event, template) {
    if (!confirm("Are you sure you want to deploy a WeiFund contract?"))
      return;

    // Prevent Double Click
    $(event.currentTarget).prop('disabled', true);

    console.log('0x' + WeiFund.bytecode);

    var transactionObject = {
      data: '0x' + WeiFund.bytecode,
      gas: web3.eth.defaultGas,
      from: web3.eth.defaultAccount
    };

    WeiFund.new(transactionObject, function(err, result) {
      if (err)
        return TemplateVar.set(template, 'state', {
          isError: true,
          error: err
        });

      TemplateVar.set(template, 'state', {
        isMining: true,
        transactionHash: result.transactionHash
      });

      if (result.address) {
        TemplateVar.set(template, 'state', {
          isMined: true,
          address: result.address,
          transactionHash: result.transactionHash
        });

        // get contracts object
        var contractsObject = LocalStore.get('contracts');
        contractsObject[LocalStore.get('network')]['WeiFund'] = result.address;

        // Update the WeiFund address
        LocalStore.set('contracts', contractsObject);
      }
    });
  },
});
