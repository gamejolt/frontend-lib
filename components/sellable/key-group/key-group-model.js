angular.module( 'gj.Sellable.KeyGroup' ).factory( 'Sellable_KeyGroup', function( Model, Sellable )
{
	function Sellable_KeyGroup( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.sellable ) {
				this.sellable = Sellable.populate( data.sellable );
			}
		}
	}

	Sellable_KeyGroup.prototype.$save = function()
	{
		if ( this.id ) {
			return this.$_save( '/web/dash/developer/sellables/key-groups/save/' + this.sellable_id + '/' + this.id, 'sellableKeyGroup' );
		}
		else {
			return this.$_save( '/web/dash/developer/sellables/key-groups/save/' + this.sellable_id, 'sellableKeyGroup' );
		}
	};

	Sellable_KeyGroup.prototype.$remove = function( disableKeys )
	{
		return this.$_remove( '/web/dash/developer/sellables/key-groups/remove/' + this.sellable_id + '/' + this.id + '/' + disableKeys );
	};

	return Model.create( Sellable_KeyGroup );
} );
