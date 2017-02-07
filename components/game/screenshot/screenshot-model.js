angular.module( 'gj.Game.Screenshot' ).factory( 'Game_Screenshot', function( $q, Model, MediaItem, Api )
{
	function Game_Screenshot( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		if ( this.media_item ) {
			this.media_item = new MediaItem( this.media_item );
		}
	}

	Game_Screenshot.prototype.getUrl = function( game )
	{
		return game.getUrl() + '#screenshot-' + this.id;
	};

	Game_Screenshot.prototype.$save = function()
	{
		var _this = this;

		if ( !this.id ) {

			// When adding, we add multiple, so we can't treat it like a normal model save.
			return Api.sendRequest( '/web/dash/developer/games/media/save/image/' + this.game_id, this, {
				file: this.file,
				progress: function( event )
				{
					_this._progress = event;
				},
			} )
				.then( function( response )
				{
					if ( response.success ) {
						return response;
					}
					return $q.reject( response );
				} );
		}
		else {
			return this.$_save( '/web/dash/developer/games/media/save/image/' + this.game_id + '/' + this.id, 'gameScreenshot' );
		}
	};

	Game_Screenshot.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/developer/games/media/remove/image/' + this.game_id + '/' + this.id );
	};

	return Model.create( Game_Screenshot );
} );
