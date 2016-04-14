angular.module( 'gj.Game.Package.Card' ).directive( 'gjGamePackageCardPaymentForm', function( $window, App, Form, Environment, Api )
{
	var form = new Form( {
		// model: 'Game_Package',
		template: '/lib/gj-lib-client/components/game/package/card/payment-form.html',
	} );

	form.scope.package = '=';
	form.scope.sellable = '=';
	form.scope.pricing = '=';

	form.onInit = function( scope )
	{
		scope.formModel.price = scope.pricing.amount ? scope.pricing.amount / 100 : null;
		scope.formState.checkoutType = 'cc-stripe';

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
	};

	form.onSubmit = function( scope )
	{
		scope.formState.checkoutType = 'cc-stripe';

		var data = {
			payment_method: scope.formState.checkoutType,
			sellable_id: scope.sellable.id,
			pricing_id: scope.pricing.id,
			amount: scope.price,
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
