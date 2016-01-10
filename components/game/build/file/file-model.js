angular.module( 'gj.Game.Build.File' ).factory( 'Game_Build_File', function( Model, Api )
{
	function Game_Build_File( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Game_Build_File.prototype.$save = function()
	{
		// Add only.
		var params = [ this.game_id, this.game_package_id, this.game_release_id, this.game_build_id ];
		if ( !this.id ) {
			return this.$_save( '/web/dash/developer/games/builds/files/save/' + params.join( '/' ), 'gameBuildFile', { file: this.file } );
		}
	};

	Game_Build_File.prototype.$remove = function( gameId, packageId, releaseId )
	{
		var params = [ gameId, packageId, releaseId, this.game_build_id, this.id ];
		return this.$_remove( '/web/dash/developer/games/builds/files/remove/' + params.join( '/' ) );
	};

	return Model.create( Game_Build_File );
} );
