angular.module( 'gj.Form' ).directive( 'gjFormCcExp', function()
{
	function parse( val )
	{
		var sanitized = val.replace( /[^\d]+/, '' );
		var m = parseInt( sanitized.substring( 0, 2 ), 10 );
		var y = parseInt( '20' + sanitized.substring( 2, 4 ), 10 );

		return { m: m, y: y };
	}

	function isValid( val )
	{
		var parsed = parse( val );
		return parsed.m < 13 && parsed.m > 0;
	}

	return {
		restrict: 'A',
		require: 'ngModel',
		compile: function( element, attr )
		{
			attr.$set( 'pattern', '[0-9]*' );

			return function( scope, $element, attr, ngModel )
			{
				ngModel.$validators.ccExpInvalid = function( modelVal, viewVal )
				{
					var val = modelVal || viewVal;

					if ( ngModel.$isEmpty( val ) ) {
						return true;
					}

					return isValid( val );
				};

				ngModel.$validators.ccExpExpired = function( modelVal, viewVal )
				{
					var val = modelVal || viewVal;

					if ( ngModel.$isEmpty( val ) ) {
						return true;
					}

					// If invalid, don't check expired yet.
					if ( !isValid( val ) ) {
						return true;
					}

					var parsed = parse( val );

					// Months are 0-based.
					// This means it will correctly push into the next month with their input
					// so that it invalidates at the beginning of the next month.
					return Date.now() < (new Date( parsed.y, parsed.m )).getTime();
				};
			};
		},
	};
} );
