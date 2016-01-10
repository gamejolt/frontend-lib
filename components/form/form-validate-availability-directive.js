angular.module( 'gj.Form' ).directive( 'gjFormValidateAvailability', function( $http, $timeout, $q, Api )
{
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function( scope, element, attrs, ngModel )
		{
			var initialVal = undefined;
			$timeout( function()
			{
				// If this model input has no value, we set our initial value to an empty string (not undefined).
				initialVal = ngModel.$viewValue || ngModel.$modelValue || '';
			} );

			ngModel.$asyncValidators.available = function( modelValue, viewValue )
			{
				var value = modelValue || viewValue;

				// Skip the check if our initial value still isn't set yet.
				// The validator runs before the initial value gets set, so skip it if we haven't gotten the initialVal yet.
				if ( angular.isUndefined( initialVal ) || ngModel.$isEmpty( value ) || initialVal === value ) {
					return $q.when( true );
				}

				return $http( {
					method: 'POST',
					url: Api.apiHost + Api.apiPath + attrs.gjFormValidateAvailability,
					data: { value: value },
					withCredentials: true,
					ignoreLoadingBar: true
				} );
			};
		}
	};
} );
