angular.module( 'gj.Analytics' ).directive( 'gjAnalyticsTrackClick', function( $interpolate, Analytics )
{
	return {
		restrict: 'A',
		link: function( scope, element, attrs )
		{
			element.on( 'click', function()
			{
				var event = $interpolate( attrs.gjAnalyticsTrackClick )( scope );
				if ( event ) {
					var pieces = event.split( ':' );
					Analytics.trackEvent( pieces[0], pieces[1], pieces[2], pieces[3] );
				}
			} );
		}
	};
} );
