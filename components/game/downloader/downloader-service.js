angular.module( 'gj.Game.Downloader' ).service( 'Game_Downloader', function( $rootScope, $window, $state, Environment, HistoryTick, Popover, Analytics )
{
	var downloadPromise;
	var shouldTransition = false;

	// Any time we transition away from the page, make sure we reset our download transition.
	$rootScope.$on( '$stateChangeStart', function()
	{
		shouldTransition = false;
	} );

	this.download = function( game, build, options )
	{
		options = options || {};

		Analytics.trackEvent( 'game-play', 'download' );

		// Bundle-only games can only live in a person's library, or as a key.
		// So if it's bundle-only, or if a key was passed in, go direct.
		// Or, uh, if it is owned.
		if ( game.bundle_only || options.key || options.isOwned ) {

			// If already waiting on a download, don't do anything.
			if ( downloadPromise ) {
				return;
			}

			// If they click away from the page before the download starts, then cancel the download redirect.
			var shouldTransition = true;
			var downloadUrl = null;
			downloadPromise = build.getDownloadUrl( { key: (options.key || null) } )
				.then( function( response )
				{
					downloadUrl = response.downloadUrl;

					// Be sure to log the build download.
					return HistoryTick.sendBeacon( 'game-build', build.id, { sourceResource: 'Game', sourceResourceId: game.id } );
				} )
				.then( function()
				{
					if ( shouldTransition ) {
						$window.location = downloadUrl;
					}
					downloadPromise = null;
				} );
		}
		// Client needs to download externally.
		else if ( Environment.isClient ) {
			var gui = require( 'nw.gui' );
			gui.Shell.openExternal( Environment.baseUrl + $state.href( 'discover.games.view.download.build', {
				slug: game.slug,
				id: game.id,
				buildId: build.id,
			} ) );

			// In case any popover was used to click the download.
			Popover.hideAll();
		}
		else {
			$state.go( 'discover.games.view.download.build', {
				slug: game.slug,
				id: game.id,
				buildId: build.id,
			} );
		}
	};
} );
