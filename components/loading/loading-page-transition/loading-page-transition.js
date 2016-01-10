angular.module( 'gj.Loading.LoadingPageTransition', [ 'angular-loading-bar' ] ).config( function( cfpLoadingBarProvider )
{
	cfpLoadingBarProvider.latencyThreshold = 200;
	cfpLoadingBarProvider.includeSpinner = false;
} );
