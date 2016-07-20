angular.module( 'gj.Game' ).factory( 'Game', function( $state, $injector, App, Model, Environment, User, MediaItem )
{
	if ( $injector.has( 'Registry' ) ) {
		$injector.get( 'Registry' ).setConfig( 'Game', {
			maxItems: 50,
		} );
	}

	function Game( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.developer && angular.isObject( data.developer ) ) {
				this.developer = new User( data.developer );
			}

			if ( data.thumbnail_media_item && angular.isObject( data.thumbnail_media_item ) ) {
				this.thumbnail_media_item = new MediaItem( data.thumbnail_media_item );
			}

			if ( data.header_media_item && angular.isObject( data.header_media_item ) ) {
				this.header_media_item = new MediaItem( data.header_media_item );
			}
		}

		this._has_cover = !!this.header_media_item;

		this.is_published = false;
		if ( this.status == Game.STATUS_VISIBLE ) {
			this.is_published = true;
		}

		this._is_finished = this.development_status == Game.DEVELOPMENT_STATUS_FINISHED;
		this._is_wip = this.development_status == Game.DEVELOPMENT_STATUS_WIP;
		this._is_devlog = this.development_status == Game.DEVELOPMENT_STATUS_DEVLOG;
		this._is_canceled = this.development_status == Game.DEVELOPMENT_STATUS_CANCELED;

		this._has_packages = false;
		if ( this.compatibility ) {
			var keys = Object.keys( this.compatibility );
			for ( var i in keys ) {
				if ( keys[ i ] != 'id' && keys[ i ] != 'game_id' ) {
					this._has_packages = true;
					break;
				}
			}
		}

		// We don't want to show ads if this game has sellable items.
		this._should_show_ads = true;
		if ( !this.ads_enabled ) {
			this._should_show_ads = false;
		}
		else if ( this.sellable && this.sellable.type != 'free' ) {
			this._should_show_ads = false;
		}

		// Should show as owned for the dev of the game.
		if (
			this.sellable
			&& this.sellable.type != 'free'
			&& App.user
			&& this.developer
			&& App.user.id == this.developer.id
		) {
			this.sellable.is_owned = true;
		}

		this._can_buy_primary_sellable = false;
		if ( this.sellable && this.sellable.type == 'paid' && !this.sellable.is_owned ) {
			this._can_buy_primary_sellable = true;
		}

		if ( $injector.has( 'Registry' ) ) {
			$injector.get( 'Registry' ).store( 'Game', this );
		}
	}

	Game.STATUS_HIDDEN = 0;
	Game.STATUS_VISIBLE = 1;
	Game.STATUS_REMOVED = 2;

	Game.DEVELOPMENT_STATUS_FINISHED = 1;
	Game.DEVELOPMENT_STATUS_WIP = 2;
	Game.DEVELOPMENT_STATUS_CANCELED = 3;
	Game.DEVELOPMENT_STATUS_DEVLOG = 4;

	Game.prototype.getSref = function( page, includeParams )
	{
		var sref = '';

		if ( page == 'dashboard' ) {
			sref = 'dashboard.developer.games.manage.game.overview';
		}
		else if ( page == 'edit' ) {
			sref = 'dashboard.developer.games.manage.game.details';
		}
		else {
			sref = 'discover.games.view.overview';
		}

		if ( includeParams ) {
			sref += '( ' + angular.toJson( this.getSrefParams( page ) ) + ' )'
		}

		return sref;
	};

	Game.prototype.getSrefParams = function( page )
	{
		if ( [ 'dashboard', 'edit' ].indexOf( page ) !== -1 ) {
			return { id: this.id };
		}

		return {
			id: this.id,
			category: this.category_slug,
			slug: this.slug
		};
	};

	Game.prototype.getUrl = function( page )
	{
		if ( page == 'soundtrack' ) {
			return '/games/' + this.slug + '/' + this.id + '/download/soundtrack';
		}

		return $state.href( this.getSref( page ), this.getSrefParams( page ) );
	};

	Game.prototype.hasDesktopSupport = function()
	{
		var compat = this.compatibility;
		return compat.os_windows
			|| compat.os_windows_64
			|| compat.os_mac
			|| compat.os_mac_64
			|| compat.os_linux
			|| compat.os_linux_64
			;
	};

	Game.prototype.hasBrowserSupport = function()
	{
		var compat = this.compatibility;
		return compat.type_html
			|| compat.type_flash
			|| compat.type_unity
			|| compat.type_applet
			|| compat.type_silverlight
			;
	};

	/**
	 * Helper function to check if the resource passed in has support for the
	 * os/arch passed in.
	 */
	Game.checkDeviceSupport = function( obj, os, arch )
	{
		if ( obj[ 'os_' + os ] ) {
			return true;
		}

		// If they are on 64bit, then we can check for 64bit only support as well.
		// If there is no arch (web site context) then we allow 64bit builds as well.
		if ( (!arch || arch == '64') && obj[ 'os_' + os + '_64' ] ) {
			return true;
		}

		return false;
	};

	Game.prototype.canInstall = function( os, arch )
	{
		// Obviously can't install if no desktop build.
		if ( !this.hasDesktopSupport() ) {
			return false;
		}

		return Game.checkDeviceSupport( this.compatibility, os, arch );
	};

	Game.pluckInstallableBuilds = function( packages, os, arch )
	{
		var pluckedBuilds = [];

		packages.forEach( function( _package )
		{
			// Don't include builds for packages that aren't bought yet.
			// Can't install them if they can't be bought.
			if (
				_package._sellable
				&& _package._sellable.type == 'paid'
				&& !_package._sellable.is_owned
			) {
				return;
			}

			_package._builds.forEach( function( build )
			{
				if ( Game.checkDeviceSupport( build, os, arch ) ) {
					pluckedBuilds.push( build );
				}
			} );
		} );

		return pluckedBuilds;
	};

	Game.pluckBrowserBuilds = function( packages )
	{
		var pluckedBuilds = [];

		packages.forEach( function( _package )
		{
			_package._builds.forEach( function( build )
			{
				if ( build.isBrowserBased() ) {
					pluckedBuilds.push( build );
				}
			} );
		} );

		return pluckedBuilds;
	};

	Game.pluckRomBuilds = function( packages )
	{
		var pluckedBuilds = [];

		packages.forEach( function( _package )
		{
			_package._builds.forEach( function( build )
			{
				if ( build.isRom() ) {
					pluckedBuilds.push( build );
				}
			} );
		} );

		return pluckedBuilds;
	};

	Game.chooseBestBuild = function( builds, os, arch )
	{
		var build, search;

		if ( arch == '64' ) {
			search = {};
			search[ 'os_' + os + '_64' ] = true;
			if ( build = _.find( builds, search ) ) {
				return build;
			}
		}

		search = {};
		search[ 'os_' + os ] = true;
		if ( build = _.find( builds, search ) ) {
			return build;
		}

		return builds[0];
	};

	Game.prototype.$save = function()
	{
		if ( this.id ) {
			return this.$_save( '/web/dash/developer/games/save/' + this.id, 'game' );
		}
		else {
			return this.$_save( '/web/dash/developer/games/save', 'game' );
		}
	};

	Game.prototype.$saveMaturity = function()
	{
		return this.$_save( '/web/dash/developer/games/maturity/save/' + this.id, 'game' );
	};

	Game.prototype.$saveThumbnail = function()
	{
		return this.$_save( '/web/dash/developer/games/thumbnail/save/' + this.id, 'game', { file: this.file, allowComplexData: [ 'crop' ] } );
	};

	Game.prototype.$saveHeader = function()
	{
		return this.$_save( '/web/dash/developer/games/header/save/' + this.id, 'game', { file: this.file } );
	};

	Game.prototype.$clearHeader = function()
	{
		return this.$_save( '/web/dash/developer/games/header/clear/' + this.id, 'game' );
	};

	Game.prototype.$setStatus = function( status )
	{
		return this.$_save( '/web/dash/developer/games/set-status/' + this.id + '/' + status, 'game' );
	};

	Game.prototype.$saveSettings = function()
	{
		return this.$_save( '/web/dash/developer/games/settings/save/' + this.id, 'game' );
	};

	Game.prototype.$remove = function( status )
	{
		return this.$_remove( '/web/dash/developer/games/remove/' + this.id );
	};

	return Model.create( Game );
} );
