angular.module( 'gj.Loading' ).directive( 'gjLoading', function( $interpolate, $parse )
{
	return {
		restrict: 'E',
		scope: true,
		template: require( '!html-loader!./loading.html' ),
		link: function( scope, element, attrs )
		{
			scope.label = attrs.label ? $interpolate( attrs.label )( scope ) : 'Loading...';

			scope.hideLabel = attrs.hideLabel ? $parse( attrs.hideLabel )( scope ) : angular.isDefined( attrs.hideLabel );
			scope.isBig = attrs.loadingBig ? $parse( attrs.loadingBig )( scope ) : angular.isDefined( attrs.loadingBig );
			scope.noColor = attrs.loadingNoColor ? $parse( attrs.loadingNoColor )( scope ) : angular.isDefined( attrs.loadingNoColor );
			scope.isStationary = attrs.loadingStationary ? $parse( attrs.loadingStationary )( scope ) : angular.isDefined( attrs.loadingStationary );

			// Make sure all these paths are full paths so that they get revisioned correctly by the build script.
			var mapping = {
				'loading': require( './loading.gif' ),
				'loading-2x': require( './loading-2x.gif' ),
				'loading-bw': require( './loading-bw.gif' ),
				'loading-bw-2x': require( './loading-bw-2x.gif' ),

				'loading-stationary': require( './loading-stationary.gif' ),
				'loading-stationary-2x': require( './loading-stationary-2x.gif' ),
				'loading-stationary-bw': require( './loading-stationary-bw.gif' ),
				'loading-stationary-bw-2x': require( './loading-stationary-bw-2x.gif' ),
			};

			var index = 'loading'
				+ (scope.isStationary ? '-stationary' : '')
				+ (scope.noColor ? '-bw' : '')
				+ (scope.isBig ? '-2x' : '');

			scope.loadingImg = mapping[ index ];
		}
	};
} );
