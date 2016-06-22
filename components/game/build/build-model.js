angular.module( 'gj.Game.Build' ).factory( 'Game_Build', function( Api, Model, Game_Build_File, Game_Build_Param )
{
	function Game_Build( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.primary_file ) {
				this.primary_file = new Game_Build_File( data.primary_file );
			}

			this.params = [];
			if ( data.params && angular.isArray( data.params ) && data.params.length ) {
				this.params = Game_Build_Param.populate( data.params );
			}

			if ( this.errors && angular.isString( this.errors ) ) {
				this.errors = this.errors.split( ',' );
			}
		}
	}

	Game_Build.TYPE_DOWNLOADABLE = 'downloadable';
	Game_Build.TYPE_HTML = 'html';
	Game_Build.TYPE_FLASH = 'flash';
	Game_Build.TYPE_SILVERLIGHT = 'silverlight';
	Game_Build.TYPE_UNITY = 'unity';
	Game_Build.TYPE_APPLET = 'applet';
	Game_Build.TYPE_ROM = 'rom';

	Game_Build.STATUS_ADDING = 'adding';
	Game_Build.STATUS_ACTIVE = 'active';
	Game_Build.STATUS_REMOVED = 'removed';

	Game_Build.ERROR_MISSING_FIELDS = 'missing-fields';
	Game_Build.ERROR_LAUNCH_OPTIONS = 'launch-options';

	Game_Build.browserTypes = [
		Game_Build.TYPE_HTML,
		Game_Build.TYPE_FLASH,
		Game_Build.TYPE_SILVERLIGHT,
		Game_Build.TYPE_UNITY,
		Game_Build.TYPE_APPLET,
	];

	Game_Build.EMULATOR_GBA = 'gba';
	Game_Build.EMULATOR_GBC = 'gbc';
	Game_Build.EMULATOR_GB = 'gb';
	Game_Build.EMULATOR_NES = 'nes';
	Game_Build.EMULATOR_VBOY = 'vb';
	Game_Build.EMULATOR_GENESIS = 'md';
	Game_Build.EMULATOR_SNES = 'snes';
	Game_Build.EMULATOR_ZX = 'zx';
	Game_Build.EMULATOR_MSX1 = 'msx1';
	Game_Build.EMULATOR_MSX2 = 'msx2';
	Game_Build.EMULATOR_ATARI2600 = 'atari2600';
	Game_Build.EMULATOR_C64 = 'c64';

	Game_Build.prototype.isBrowserBased = function()
	{
		return Game_Build.browserTypes.indexOf( this.type ) != -1;
	};

	Game_Build.prototype.isRom = function()
	{
		return this.type == Game_Build.TYPE_ROM;
	};

	Game_Build.prototype.hasError = function( error )
	{
		return this.errors && this.errors.indexOf( error ) !== -1;
	};

	Game_Build.prototype.getDownloadUrl = function( options )
	{
		options = options || {};

		// This is a game key so you can access games that you have a key for.
		var data = {};
		if ( options.key ) {
			data.key = options.key;
		}

		return Api.sendRequest( '/web/discover/games/builds/get-download-url/' + this.id, data );
	};

	Game_Build.prototype.$save = function()
	{
		var params = [ this.game_id, this.game_package_id, this.game_release_id ];
		if ( !this.id ) {
			return this.$_save( '/web/dash/developer/games/builds/save/' + params.join( '/' ), 'gameBuild', { file: this.file } );
		}
		else {
			// May or may not have an upload file on an edit.
			params.push( this.id );
			return this.$_save( '/web/dash/developer/games/builds/save/' + params.join( '/' ), 'gameBuild' );
		}
	};

	Game_Build.prototype.$remove = function()
	{
		var params = [ this.game_id, this.game_package_id, this.game_release_id, this.id ];
		return this.$_remove( '/web/dash/developer/games/builds/remove/' + params.join( '/' ) );
	};

	return Model.create( Game_Build );
} );
