angular.module('gj.Form').directive('gjFormErrorBlock', function() {
	return {
		restrict: 'A',
		scope: {
			formField: '=gjFormErrorBlock',
			errorLabels: '=gjErrorLabels',
			position: '@gjErrorPosition',
		},
		template: require('!html-loader!./form-error-block.html'),
	};
});
