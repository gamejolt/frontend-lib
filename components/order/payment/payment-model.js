angular.module( 'gj.Order.Payment' ).factory( 'Order_Payment', function( Model )
{
	function Order_Payment( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Order_Payment.METHOD_CC_STRIPE = 'cc-stripe';
	Order_Payment.METHOD_PAYPAL = 'paypal';
	Order_Payment.METHOD_AMAZON = 'amazon';
	Order_Payment.METHOD_WALLET = 'wallet';

	return Model.create( Order_Payment );
} );
