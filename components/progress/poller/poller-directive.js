angular.module( 'gj.Progress.Poller' ).directive( 'gjProgressPoller', function()
{
	var POLL_INTERVAL = 5000;

	return {
		restrict: 'A',
		controller: function( $scope, $interval, $attrs, $parse, Api )
		{
			var poller = null;
			var url = null;
			var onComplete = null;

			if ( $attrs.progressPollerOnComplete ) {
				onComplete = $parse( $attrs.progressPollerOnComplete );
			}

			$attrs.$observe( 'gjProgressPoller', function( _url )
			{
				url = _url;
			} );

			// New build gets a progress poller.
			poller = $interval( function()
			{
				if ( !url ) {
					return;
				}

				Api.sendRequest( url, null, { detach: true } )
					.then( function( response )
					{
						if ( response.status == 'complete' ) {

							if ( onComplete ) {
								onComplete( $scope, {
									'$response': response,
								} );
							}

							$interval.cancel( poller );
							poller = null;
						}
					} );
			}, POLL_INTERVAL );

			$scope.$on( '$destroy', function()
			{
				if ( poller ) {
					$interval.cancel( poller );
				}
			} );
		}
	};
} );
