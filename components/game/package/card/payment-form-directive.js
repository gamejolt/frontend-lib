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
		scope.formModel.country = 'US';

		scope.cards = [];
		scope.walletBalance = 0;
		scope.walletVisible = false;

		load();

		scope.collectAddress = function( checkoutType )
		{
			scope.formState.checkoutStep = 'address';
			scope.formState.checkoutType = checkoutType;
			scope.formState.countries = Geo.getCountries();
		};

		scope.checkoutCard = function()
		{
			scope.formState.checkoutType = 'cc-stripe';
			scope.onSubmit();
		};

		scope.checkoutPaypal = function()
		{
			scope.formState.checkoutType = 'paypal';
			scope.onSubmit();
		};

		scope.startOver = function()
		{
			scope.formState.checkoutStep = 'primary';
		};

		scope.useSavedCard = function( card )
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
		};

		scope.useWallet = function()
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
				reside_in_country: scope.formModel.reside_in_country,
			};

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
		};

		scope.priceChanged = function ( price )
		{
			price = price || scope.formModel.price;
			scope.walletVisible = (scope.sellable.type == 'paid' && scope.walletBalance >= scope.pricing.amount) && scope.walletBalance >= price;
			console.log('form model price changed ' + price);
		}
		scope.$watch( 'formModel.price', scope.priceChanged );
		scope.priceChanged();

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
				if ( response && response.walletBalance && response.walletBalance > 0 ) {
					scope.walletBalance = response.walletBalance;
					scope.priceChanged();
				}
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
			reside_in_country: scope.formModel.reside_in_country,
		};

		if ( !App.user ) {
			data.email_address = scope.formModel.email_address;
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
