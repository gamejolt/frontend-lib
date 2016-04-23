angular.module( 'gj.Order.Address' ).factory( 'Order_Address', function( Model )
{
	function Order_Address( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Order_Address.TYPE_BILLING = 'billing';
	Order_Address.TYPE_SHIPPING = 'shipping';

	return Model.create( Order_Address );
} );
