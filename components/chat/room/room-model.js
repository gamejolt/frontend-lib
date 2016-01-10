angular.module( 'gj.Chat.Room' ).factory( 'Chat_Room', function( Model )
{
	function Chat_Room( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Chat_Room.TYPE_PM = 'pm';
	Chat_Room.TYPE_OPEN_GROUP = 'open_group';
	Chat_Room.TYPE_CLOSED_GROUP = 'closed_group';
	Chat_Room.TYPE_VIRAL_GROUP = 'viral_group';

	Chat_Room.prototype.$save = function()
	{
		if ( !this.id ) {
			return this.$_save( '/web/chat/rooms/save', 'chatRoom' );
		}
		else {
			return this.$_save( '/web/chat/rooms/save/' + this.id, 'chatRoom' );
		}
	};

	return Model.create( Chat_Room );
} );
