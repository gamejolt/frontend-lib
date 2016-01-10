angular.module( 'gj.Colorpicker' ).directive( 'gjColorpicker', function( $window )
{
	return {
		restrict: 'A',
		require: 'ngModel',
		scope: {
			inputOptions: '=gjColorpicker'
		},
		link: function( scope, element, attrs, ngModel )
		{
			var jqElem = $window.jQuery( element[0] );

			// Gather the initial options for Spectrum.
			var initialOptions = angular.extend( {
				color: ngModel.$viewValue,
				preferredFormat: 'hex6',
				showInitial: true,
				showInput: true,
				change: function( color )
				{
					scope.$apply( function()
					{
						// Any time sepctrum changes, we want to update the model attached to it.
						ngModel.$setViewValue( color ? color.toHexString() : '' );
					} );
				}
			}, scope.inputOptions );

			// Load it up with the initial options.
			jqElem.spectrum( initialOptions );

			// Any time the model changes, we want to update Spectrum.
			ngModel.$render = function()
			{
				jqElem.spectrum( 'set', ngModel.$viewValue || '' );
			};

			// This allows us to make the input options dynamic.
			// Any time an input option changes, we want to update Spectrum with the new options.
			scope.$watch( 'inputOptions', function( newVal, oldVal )
			{
				// Only update if it's changed.
				// newVal and oldVal will be the same if it's the initial load.
				// This is good since we want the above options input to handle that case.
				if ( !angular.equals( newVal, oldVal ) ) {
					jqElem.spectrum( newVal );
				}
			} );

			// Clean up when it's destroyed.
			scope.$on( '$destroy', function()
			{
				jqElem.spectrum( 'destroy' );
			} );
		}
	};
} );
