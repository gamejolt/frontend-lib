angular.module( 'gj.Growls' ).directive( 'gjGrowls', function( Growls )
{
	return {
		restrict: 'E',
		templateUrl: '/lib/gj-lib-client/components/growls/growls.html',
		link: function( scope, element )
		{
			scope.Growls = Growls;
		}
	};
} );
