angular.module( 'gj.Order.Payment' ).factory( 'Order_Payment_Refund', function( Model )
{
	function Order_Payment_Refund( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	return Model.create( Order_Payment_Refund );
} );
