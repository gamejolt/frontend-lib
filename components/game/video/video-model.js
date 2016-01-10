angular.module( 'gj.Game.Video' ).factory( 'Game_Video', function( Model )
{
	function Game_Video( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Game_Video.TYPE_YOUTUBE = 'youtube';
	Game_Video.TYPE_VIMEO = 'vimeo';

	// Examples...
	// https://www.youtube.com/watch?v=DSvQAx5-PXU
	// http://www.youtube.com/watch?v=DSvQAx5-PXU
	// http://www.youtube.com/watch?v=DSvQAx5-PXU&bdfglkhdfg
	// www.youtube.com/watch?v=DSvQAx5-PXU
	// http://youtube.com/watch?v=DSvQAx5-PXU
	// youtube.com/watch?v=DSvQAx5-PXU
	// http://youtu.be/Y6lUVz1kdOk
	// http://youtu.be/Y6lUVz1kdOk?testing
	// http://vimeo.com/98hfg98dhfg
	Game_Video.REGEX = {
		VIDEO: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)([a-zA-Z0-9_\-]+)(\S*)$/i,
		YOUTUBE: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_\-]+)(\S*)$/i,
		VIMEO: /^(https?:\/\/)?(www\.)?(vimeo\.com\/)([a-zA-Z0-9_\-]+)(\S*)$/i
	};

	Game_Video.prototype.getUrl = function( game )
	{
		return game.getUrl() + '#video-' + this.id;
	};

	Game_Video.prototype.$save = function()
	{
		if ( !this.id ) {
			return this.$_save( '/web/dash/developer/games/media/save/video/' + this.game_id, 'gameVideo' );
		}
		else {
			return this.$_save( '/web/dash/developer/games/media/save/video/' + this.game_id + '/' + this.id, 'gameVideo' );
		}
	};

	Game_Video.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/developer/games/media/remove/video/' + this.game_id + '/' + this.id );
	};

	return Model.create( Game_Video );
} );
