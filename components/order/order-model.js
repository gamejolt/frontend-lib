angular.module( 'gj.Order' ).factory( 'Order', function( Model, Order_Item, Order_Payment )
{
	function Order( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.items ) {
				this.items = Order_Item.populate( data.items );

				// Whether or not the whole order is refunded (all items).
				this._is_refunded = !_.find( this.items, { is_refunded: false } );
			}

			if ( data.payments ) {
				this.payments = Order_Payment.populate( data.payments );
			}
		}
	}

	return Model.create( Order );
} );
