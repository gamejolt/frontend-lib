angular.module( 'gj.Game.Release' ).factory( 'Game_Release', function( Api, Model )
{
	function Game_Release( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.republished_release ) {
				this.republished_release = new Game_Release( data.republished_release );
			}
		}
	}

	Game_Release.STATUS_HIDDEN = 'hidden';
	Game_Release.STATUS_PUBLISHED = 'published';
	Game_Release.STATUS_REMOVED = 'removed';

	Game_Release.prototype.$save = function()
	{
		if ( !this.id ) {
			return this.$_save( '/web/dash/developer/games/releases/save/' + this.game_id + '/' + this.game_package_id, 'gameRelease' );
		}
		else {
			return this.$_save( '/web/dash/developer/games/releases/save/' + this.game_id + '/' + this.game_package_id + '/' + this.id, 'gameRelease' );
		}
	};

	Game_Release.prototype.$publish = function()
	{
		return this.$_save( '/web/dash/developer/games/releases/publish/' + this.game_id + '/' + this.game_package_id + '/' + this.id, 'gameRelease' );
	};

	Game_Release.prototype.$unpublish = function()
	{
		return this.$_save( '/web/dash/developer/games/releases/unpublish/' + this.game_id + '/' + this.game_package_id + '/' + this.id, 'gameRelease' );
	};

	Game_Release.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/developer/games/releases/remove/' + this.game_id + '/' + this.game_package_id + '/' + this.id );
	};

	return Model.create( Game_Release );
} );
