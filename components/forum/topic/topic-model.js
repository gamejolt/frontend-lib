angular.module( 'gj.Forum.Topic' ).factory( 'Forum_Topic', function( Model )
{
	function Forum_Topic( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Forum_Topic.prototype.$save = function()
	{
		var url = '/web/forums/topics/save/' + this.channel_id;

		if ( !this.id ) {
			return this.$_save( url, 'forumTopic' );
		}
		else {
			return this.$_save( url + '/' + this.id, 'forumTopic' );
		}
	};

	return Model.create( Forum_Topic );
} );
