angular.module( 'gj.Key' ).factory( 'Key', function( Model )
{
	function Key( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Key.prototype.url = function() {
		return "/claim/" + this.key;
	}

	Key.prototype.$remove = function( status )
	{
		return this.$_remove( '/web/dash/developer/sellables/key-groups/remove-key/' + this.resource_id + '/' + this.sellable_key_group_id + '/' + this.id );
	};

	return Model.create( Key );
} );
