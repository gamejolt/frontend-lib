angular.module( 'gj.Game.Package' ).factory( 'Game_Package', function( $q, Api, App, Model, Game_Release, Game_Build, Game_Build_LaunchOption, Sellable )
{
	function Game_Package( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Game_Package.STATUS_HIDDEN = 'hidden';
	Game_Package.STATUS_ACTIVE = 'active';
	Game_Package.STATUS_REMOVED = 'removed';

	Game_Package.prototype.shouldShowNamePrice = function()
	{
		return this._sellable
			&& this._sellable.type == 'pwyw'
			&& !this._sellable.is_owned;
	};

	Game_Package.$saveSort = function( gameId, packagesSort )
	{
		return Api.sendRequest( '/web/dash/developer/games/packages/save-sort/' + gameId, packagesSort );
	};

	Game_Package.processPackagePayload = function( payload )
	{
		var packageData = {};

		packageData.packages = payload.packages ? Game_Package.populate( payload.packages ) : [];
		packageData.releases = payload.releases ? Game_Release.populate( payload.releases ) : [];
		packageData.builds = payload.builds ? Game_Build.populate( payload.builds ) : [];
		packageData.launchOptions = payload.launchOptions ? Game_Build_LaunchOption.populate( payload.launchOptions ) : [];
		packageData.sellables = payload.sellables ? Sellable.populate( payload.sellables ) : [];

		// For convenient access in other methods.
		var i;
		var indexedPackages = _.indexBy( packageData.packages, 'id' );
		var indexedReleases = _.indexBy( packageData.releases, 'id' );
		var indexedSellables = _.indexBy( packageData.sellables, 'game_package_id' );

		for ( i in packageData.packages ) {
			var _package = packageData.packages[ i ];
			_package._releases = _.where( packageData.releases, { game_package_id: _package.id } );
			_package._builds = _.where( packageData.builds, { game_package_id: _package.id } );
			_package._sellable = indexedSellables[ _package.id ];

			// If this is the developer of the game, then spoof that they own the game/package.
			if ( _package.is_game_owner && _package._sellable ) {
				_package._sellable.is_owned = true;
			}
		}

		for ( i in packageData.releases ) {
			var release = packageData.releases[ i ];
			release._package = indexedPackages[ release.game_package_id ];
			release._builds = _.where( release._package._builds, { game_release_id: release.id } );
		}

		for ( i in packageData.builds ) {
			var build = packageData.builds[ i ];
			build._package = indexedPackages[ build.game_package_id ];
			build._release = indexedReleases[ build.game_release_id ];
			build._launch_options = _.where( packageData.launchOptions, { game_build_id: build.id } );
		}

		return packageData;
	};

	Game_Package.prototype.$save = function()
	{
		if ( !this.id ) {
			return this.$_save( '/web/dash/developer/games/packages/save/' + this.game_id, 'gamePackage' );
		}
		else {
			return this.$_save( '/web/dash/developer/games/packages/save/' + this.game_id + '/' + this.id, 'gamePackage' );
		}
	};

	Game_Package.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/developer/games/packages/remove/' + this.game_id + '/' + this.id );
	};

	return Model.create( Game_Package );
} );
