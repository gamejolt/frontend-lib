angular.module( 'gj.Growls' ).directive( 'gjGrowls', function( Growls )
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./growls.html' ),
		link: function( scope, element )
		{
			scope.Growls = Growls;
		}
	};
} );
