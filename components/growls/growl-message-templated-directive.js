angular.module( 'gj.Growls' ).directive( 'gjGrowlMessageTemplated', function( $parse )
{
	return {
		restrict: 'A',
		link: function( scope, element, attrs )
		{
			// Only activate if this we are a templated growl message.
			if ( !$parse( attrs.gjGrowlMessageTemplated )( scope ) ) {
				return;
			}

			var message = scope.message;

			// Clear out the content.
			element.empty().append( message.element );
		}
	};
} );
