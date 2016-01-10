angular.module( 'gj.Form' ).directive( 'gjFormErrorBlock', function()
{
	return {
		restrict: 'A',
		scope: {
			formField: '=gjFormErrorBlock',
			errorLabels: '=gjErrorLabels',
			position: '@gjErrorPosition'
		},
		templateUrl: '/lib/gj-lib-client/components/form/form-error-block.html'
	};
} );