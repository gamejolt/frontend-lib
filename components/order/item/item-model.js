angular.module( 'gj.Order.Item' ).factory( 'Order_Item', function( Model, Sellable )
{
	function Order_Item( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.sellable ) {
				this.sellable = new Sellable( data.sellable );
			}
		}
	}

	return Model.create( Order_Item );
} );
