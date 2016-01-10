angular.module( 'gj.Form' ).directive( 'inputGroup', function()
{
	return {
		restrict: 'EA',
		require: 'inputGroup',
		controller: function()
		{
			// Whether or not an addon in this group is hidden.
			// If so, then we shouldn't show the input-group class and it should behave as an ordinary input.
			this.isHidden = false;
		},
		link: function( scope, element, attrs, inputGroup )
		{
			element.addClass( 'input-group' );

			/**
			 * Watch for if the input group changes.
			 */
			scope.$watch( function()
			{
				return inputGroup.isHidden;
			},
			function( isHidden )
			{
				if ( !isHidden ) {
					element.addClass( 'input-group' );
				}
				else {
					element.removeClass( 'input-group' );
				}
			} );
		}
	};
} );