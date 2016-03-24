angular.module( 'gj.Game.Package.Card' ).directive( 'gjGamePackageCard', function(
	$timeout, $injector, Screen, Game, Game_Build, Game_PlayModal, Game_Downloader, Device, Environment, Analytics )
{
	/**
	 * Sort must start at 1 so that we can put their prefered OS as sort 0 later on.
	 */
	var supportInfo = {
		windows: {
			icon: 'windows',
			tooltip: 'Windows Support',
			sort: 10,
		},
		windows_64: {
			icon: 'windows',
			tooltip: 'Windows 64-bit Support',
			arch: '64',
			sort: 11,
		},
		mac: {
			icon: 'mac',
			tooltip: 'Mac Support',
			sort: 20,
		},
		mac_64: {
			icon: 'mac',
			tooltip: 'Mac 64-bit Support',
			arch: '64',
			sort: 21,
		},
		linux: {
			icon: 'linux',
			tooltip: 'Linux Support',
			sort: 30,
		},
		linux_64: {
			icon: 'linux',
			tooltip: 'Linux 64-bit Support',
			arch: '64',
			sort: 30,
		},
		other: {
			icon: 'other-os',
			tooltip: 'Downloadable File',
			sort: 40,
		},
		html: {
			icon: 'html5',
			tooltip: 'Web Playable',
			sort: 50,
		},
		flash: {
			icon: 'flash',
			tooltip: 'Flash Web Playable',
			sort: 51,
		},
		unity: {
			icon: 'unity',
			tooltip: 'Unity Web Playable',
			sort: 52,
		},
		applet: {
			icon: 'java',
			tooltip: 'Java Applet Web Playable',
			sort: 53,
		},
		silverlight: {
			icon: 'silverlight',
			tooltip: 'Silverlight Web Playable',
			sort: 54,
		},
	};

	function pluckOsSupport( build )
	{
		var support = [];

		// We only include the 64-bit versions if the build doesn't have 32bit and 64bit
		// on the same build. That basically just means it's a universal build.

		if ( build.os_windows ) {
			support.push( 'windows' );
		}

		if ( build.os_windows_64 && !build.os_windows ) {
			support.push( 'windows_64' );
		}

		if ( build.os_mac ) {
			support.push( 'mac' );
		}

		if ( build.os_mac_64 && !build.os_mac ) {
			support.push( 'mac_64' );
		}

		if ( build.os_linux ) {
			support.push( 'linux' );
		}

		if ( build.os_linux_64 && !build.os_linux ) {
			support.push( 'linux_64' );
		}

		if ( build.os_other ) {
			support.push( 'other' );
		}

		return support;
	}

	function checkSupport( support, type )
	{
		return support.indexOf( type ) !== -1;
	}

	return {
		restrict: 'E',
		templateUrl: '/lib/gj-lib-client/components/game/package/card/card.html',
		scope: {},
		bindToController: {
			game: '=game',
			'package': '=gamePackage',
			releases: '=gameReleases',
			builds: '=gameBuilds',
			key: '@?',
			launchOptions: '=?gameBuildLaunchOptions',
		},
		controllerAs: 'ctrl',
		controller: function( $scope, $attrs, $parse )
		{
			var _this = this;

			$scope.Environment = Environment;
			$scope.Screen = Screen;
			$scope.Game_Build = Game_Build;

			this.showFullDescription = false;
			this.canToggleDescription = undefined;

			this.supportInfo = angular.copy( supportInfo );
			this.support = [];

			this.downloadableBuild = null;
			this.browserBuild = null;
			this.extraBuilds = [];

			this.showcasedRelease = null;
			this.showcasedOs = null;
			this.showcasedOsIcon = null;
			this.showcasedBrowserIcon = null;

			this.otherOnly = false;

			// If this game is in their installed games, this will populate.
			this.installedBuild = null;

			if ( this.builds ) {

				var os = Device.os();
				var arch = Device.arch();  // Will only be set in client.

				// Indexes by the os/type of the build: [ { type: build } ]
				// While looping we also gather all OS/browser support for this complete package.
				var indexedBuilds = {};
				var otherBuilds = [];
				this.builds.forEach( function( build )
				{
					if ( build.isBrowserBased() ) {
						indexedBuilds[ build.type ] = build;
						this.support.push( build.type );
					}
					else if ( build.os_other ) {
						otherBuilds.push( build );
					}
					else {
						var support = pluckOsSupport( build );
						support.forEach( function( _os )
						{
							indexedBuilds[ _os ] = build;
							this.support.push( this.supportInfo[ _os ].icon );
						}, this );
					}
				}, this );

				this.support = _.uniq( this.support );

				// At this point we should have all the OS/browser support, so let's sort it.
				// The sort values are defined above, but we want to push their detected OS at
				// the front. This is because you'd probably want to see [linux] first if you're
				// on a linux machine, before windows, etc.
				// We change the sort for their detected OS to be the first before sorting.
				this.supportInfo[ os ].sort = 0;
				this.support.sort( function( a, b )
				{
					return _this.supportInfo[ a ].sort - _this.supportInfo[ b ].sort;
				} );

				// Now that we have all the builds indexed by the platform they support
				// we need to try to pick one to showcase as the default download. We put
				// their detected OS first so that it tries to pick that one first.
				// Arch is only detected in Client.
				var checkDownloadables = [ 'windows', 'windows_64', 'mac', 'linux' ];

				// This will put the 64 bit version as higher priority.
				if ( arch == '64' ) {
					checkDownloadables.unshift( os );
					checkDownloadables.unshift( os + '_64' );
				}
				// If we don't have a detected arch that is 64, we prioritize the universal version.
				else {
					checkDownloadables.unshift( os + '_64' );
					checkDownloadables.unshift( os );
				}

				checkDownloadables.every( function( _os )
				{
					if ( !indexedBuilds[ _os ] ) {
						return true;
					}
					this.downloadableBuild = indexedBuilds[ _os ];
					this.showcasedOs = _os;
					this.showcasedOsIcon = _this.supportInfo[ _os ].icon;
				}, this );

				// Do the same with browser type. Pick the default browser one to show.
				[ 'html', 'flash', 'unity', 'applet', 'silverlight' ].every( function( type )
				{
					if ( !indexedBuilds[ type ] ) {
						return true;
					}
					this.browserBuild = indexedBuilds[ type ];
					this.showcasedBrowserIcon = _this.supportInfo[ type ].icon;
				}, this );

				// Pull the showcased release version.
				// It should be the greater one for either the downloadable or browser build chosen.
				if ( this.downloadableBuild ) {
					this.showcasedRelease = this.downloadableBuild._release;
				}

				// Lower sort value is a "newer" version.
				if ( this.browserBuild && (!this.showcasedRelease || this.browserBuild._release.sort < this.showcasedRelease) ) {
					this.showcasedRelease = this.browserBuild._release;
				}

				// Now pull the extra builds (ones that aren't default).
				angular.forEach( indexedBuilds, function( build, type )
				{
					if ( build == _this.downloadableBuild && type == _this.showcasedOs ) {
						return;
					}

					if ( build.type != Game_Build.TYPE_DOWNLOADABLE ) {
						if ( _this.browserBuild && _this.browserBuild.id == build.id ) {
							return;
						}
					}

					_this.extraBuilds.push( {
						type: build.type,
						icon: _this.supportInfo[ type ].icon,
						build: build,
						arch: _this.supportInfo[ type ].arch || null,
						platform: type,
					} );
				} );

				// Add all the "Other" builds onto the end of extra.
				if ( otherBuilds.length ) {
					otherBuilds.forEach( function( build )
					{
						_this.extraBuilds.push( {
							type: build.type,
							icon: _this.supportInfo['other'].icon,
							build: build,
							platform: 'other',
						} );
					} );
				}

				// Sort extra builds if there are any.
				if ( this.extraBuilds.length ) {
					this.extraBuilds.sort( function( a, b )
					{
						return _this.supportInfo[ a.platform ].sort - _this.supportInfo[ b.platform ].sort;
					} );
				}

				if ( !this.downloadableBuild && !this.browserBuild && otherBuilds.length ) {
					this.otherOnly = true;
					this.showcasedRelease = this.releases[0];
				}
			}

			this.buildClick = function( build )
			{
				if ( build.type == Game_Build.TYPE_DOWNLOADABLE ) {
					this.download( build );
				}
				else if ( build.isBrowserBased() ) {
					this.showBrowserModal( build );
				}
			};

			this.download = function( build )
			{
				Analytics.trackEvent( 'game-package-card', 'download', 'download' );

				Game_Downloader.download( this.game, build, {
					key: this.key,
				} );
			};

			this.showBrowserModal = function( build )
			{
				Analytics.trackEvent( 'game-package-card', 'download', 'play' );

				Game_PlayModal.show( this.game, build );
			};
		}
	};
} );
