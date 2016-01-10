angular.module( 'gj.Translate', [ 'pascalprecht.translate' ] ).config( function( $translateProvider, $translatePartialLoaderProvider )
{
	var prefix = '';
	if ( window.location.href.search( /^app\:\/\/game\-jolt\-client\/package\// ) !== -1 ) {
		prefix = '/package';
	}

	$translateProvider.useLoader( '$translatePartialLoader', {
		urlTemplate: prefix + '/app/translations/{lang}/{part}.json'
	} );

	$translateProvider.preferredLanguage( 'en' );
} );
