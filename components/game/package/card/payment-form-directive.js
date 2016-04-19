angular.module( 'gj.Game.Package.Card' ).directive( 'gjGamePackageCardPaymentForm', function( $window, App, Form, Environment, Api, Geo )
{
	var form = new Form( {
		template: '/lib/gj-lib-client/components/game/package/card/payment-form.html',
	} );

	form.scope.package = '=';
	form.scope.sellable = '=';
	form.scope.pricing = '=';

	form.onInit = function( scope )
	{
		scope.App = App;

		scope.formState.checkoutType = 'cc-stripe';
		scope.formState.checkoutStep = 'primary';

		scope.formModel.price = scope.pricing.amount ? scope.pricing.amount / 100 : null;
		scope.formModel.country = 'US';

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
