angular.module( 'gj.Game.Build.Param' ).factory( 'Game_Build_Param', function( Model )
{
	function Game_Build_Param( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Game_Build_Param.prototype.$save = function()
	{
		// Add only.
		var params = [ this.game_id, this.game_package_id, this.game_release_id, this.game_build_id ];
		if ( !this.id ) {
			return this.$_save( '/web/dash/developer/games/builds/params/save/' + params.join( '/' ), 'gameBuildParam' );
		}
	};

	Game_Build_Param.prototype.$remove = function( gameId, packageId, releaseId )
	{
		var params = [ gameId, packageId, releaseId, this.game_build_id, this.id ];
		return this.$_remove( '/web/dash/developer/games/builds/params/remove/' + params.join( '/' ) );
	};

	return Model.create( Game_Build_Param );
} );
