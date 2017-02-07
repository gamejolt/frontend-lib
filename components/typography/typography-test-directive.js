angular.module( 'gj.Typography' ).directive( 'gjTypographyTest', function()
{
	return {
		restrict: 'EA',
		template: require( '!html-loader!./typography-test.html' )
	};
} );
