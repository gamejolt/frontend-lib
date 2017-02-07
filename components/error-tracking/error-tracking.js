angular.module( 'gj.ErrorTracking', [] )
	.config( function( $provide )
	{
		$provide.decorator( '$exceptionHandler', function( $delegate )
		{
			return function( error, cause )
			{
				if ( window.gjTrackError ) {
					window.gjTrackError( error );
				}

				$delegate( error, cause );
			};
		} );
	} );

require( './error-tracking-vendor' );
