angular.module( 'gj.Order' ).factory( 'Order', function( Model, Order_Item, Order_Payment, Order_Address )
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

			if ( data.addresses ) {
				this.addresses = Order_Address.populate( data.addresses );
				this.billing_address = _.find( this.addresses, { type: Order_Address.TYPE_BILLING } );
				this.shipping_address = _.find( this.addresses, { type: Order_Address.TYPE_SHIPPING } );
			}
		}
	}

	return Model.create( Order );
} );
