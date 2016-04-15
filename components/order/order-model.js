angular.module( 'gj.Order' ).factory( 'Order', function( Model, Order_Item )
{
	function Order( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.items ) {
				this.items = Order_Item.populate( data.items );
			}
		}
	}

	return Model.create( Order );
} );
