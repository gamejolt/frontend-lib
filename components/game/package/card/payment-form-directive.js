angular.module( 'gj.Game.Package.Card' ).directive( 'gjGamePackageCardPaymentForm', function( $window, App, Screen, Form, Environment, Api, Geo, gjCurrencyFilter )
{
	var form = new Form( {
		template: '/lib/gj-lib-client/components/game/package/card/payment-form.html',
	} );

	form.scope.package = '=';
	form.scope.sellable = '=';
	form.scope.pricing = '=';
	form.scope.onBought = '&';

	form.onInit = function( scope )
	{
		scope.Screen = Screen;
		scope.App = App;
		scope.gjCurrencyFilter = gjCurrencyFilter;

		scope.formState.isLoaded = false;
		scope.formState.isProcessing = false;
		scope.formState.checkoutType = 'cc-stripe';
		scope.formState.checkoutStep = 'primary';

		scope.formModel.price = scope.pricing.amount ? scope.pricing.amount / 100 : null;
		scope.formModel.country = 'us';

		scope.cards = [];
		scope.addresses = [];
		scope.walletBalance = 0;

		scope.collectAddress = collectAddress;
		scope.checkoutCard = checkoutCard;
		scope.checkoutPaypal = checkoutPaypal;
		scope.startOver = startOver;
		scope.checkoutSavedCard = checkoutSavedCard;
		scope.checkoutWallet = checkoutWallet;
		scope.hasSufficientWalletFunds = hasSufficientWalletFunds;

		load();

		scope.$watch( 'formModel.country', function( country )
		{
			scope.formState.regions = Geo.getRegions( country );
			if ( scope.formState.regions ) {
				scope.formModel.region = scope.formState.regions[0].code;  // Default to first.
			}
			else {
				scope.formModel.region = '';
			}
		} );

		function load()
		{
			Api.sendRequest( '/web/checkout/methods', null, { detach: true } ).then( function( response )
			{
				scope.formState.isLoaded = true;

				if ( response && response.cards && response.cards.length ) {
					scope.cards = response.cards;
				}

				if ( response && response.billingAddresses && response.billingAddresses.length ) {
					scope.addresses = response.billingAddresses;
				}

				if ( response && response.walletBalance && response.walletBalance > 0 ) {
					scope.walletBalance = response.walletBalance;
				}
			} );
		}

		function hasSufficientWalletFunds()
		{
			return scope.walletBalance >= scope.pricing.amount && scope.walletBalance >= (scope.formModel.price * 100);
		}

		function collectAddress( checkoutType )
		{
			if ( scope.addresses.length ) {
				if ( checkoutType == 'paypal' ) {
					checkoutPaypal();
					return;
				}
				else if ( checkoutType == 'wallet' ) {
					checkoutWallet();
					return;
				}
			}
			scope.formState.checkoutStep = 'address';
			scope.formState.checkoutType = checkoutType;
			scope.formState.countries = Geo.getCountries();
		}

		function checkoutCard()
		{
			scope.formState.checkoutType = 'cc-stripe';
			scope.onSubmit();
		}

		function checkoutPaypal()
		{
			scope.formState.checkoutType = 'paypal';
			scope.onSubmit();
		}

		function startOver()
		{
			scope.formState.checkoutStep = 'primary';
		}

		function checkoutSavedCard( card )
		{
			scope.formState.shouldShowSpinner = true;

			var data = {
				payment_method: 'cc-stripe',
				sellable_id: scope.sellable.id,
				pricing_id: scope.pricing.id,
				amount: scope.formModel.price * 100,
			};

			return Api.sendRequest( '/web/checkout/setup-order', data )
				.then( function( response )
				{
					var data = {
						payment_source: card.id,
					};

					return Api.sendRequest( '/web/checkout/charge/' + response.cart.id, data );
				} )
				.then( function()
				{
					scope.onBought( {} );
				} )
				.catch( function()
				{
					scope.formState.shouldShowSpinner = false;

					// TODO: Finish this.
					console.log( 'There was a problem.' );
				} );
		}

		function checkoutWallet()
		{
			scope.formState.shouldShowSpinner = true;

			var data = {
				payment_method: scope.formState.checkoutType,
				sellable_id: scope.sellable.id,
				pricing_id: scope.pricing.id,
				amount: scope.formModel.price * 100,

				country: scope.formModel.country,
				street1: scope.formModel.street1,
				region: scope.formModel.region,
				postcode: scope.formModel.postcode,
			};

			if ( scope.addresses.length ) {
				data.address_id = scope.addresses[0].id;
			}

			return Api.sendRequest( '/web/checkout/setup-order', data )
				.then( function( response )
				{
					return Api.sendRequest( '/web/checkout/charge/' + response.cart.id, { wallet: true } );
				} )
				.then( function()
				{
					scope.onBought( {} );
				} )
				.catch( function()
				{
					scope.formState.shouldShowSpinner = false;

					// TODO: Finish this.
					console.log( 'There was a problem.' );
				} );
		}
	};

	form.onSubmit = function( scope )
	{
		var data = {
			payment_method: scope.formState.checkoutType,
			sellable_id: scope.sellable.id,
			pricing_id: scope.pricing.id,
			amount: scope.formModel.price * 100,

			country: scope.formModel.country,
			street1: scope.formModel.street1,
			region: scope.formModel.region,
			postcode: scope.formModel.postcode,
		};

		if ( !App.user ) {
			data.email_address = scope.formModel.email_address;
		}

		if ( scope.addresses.length ) {
			data.address_id = scope.addresses[0].id;
		}

		return Api.sendRequest( '/web/checkout/setup-order', data )
			.then( function( response )
			{
				if ( Environment.isClient ) {
					require( 'nw.gui' ).Shell.openExternal( response.redirectUrl );
				}
				else {
					$window.location = response.redirectUrl;
				}
			} );
	};

	return form;
} );
