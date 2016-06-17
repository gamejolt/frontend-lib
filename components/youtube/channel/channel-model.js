angular.module( 'gj.Youtube.Channel' ).factory( 'Youtube_Channel', function( Model, User, Api )
{
	function Youtube_Channel( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		if ( this.user ) {
			this.user = new User( this.user );
		}
	}

	Youtube_Channel.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/linked-accounts/unlink/youtube-channel/' + this.channel_id, 'user' );
	};

	return Model.create( Youtube_Channel );
} );
