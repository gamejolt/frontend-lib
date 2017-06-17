angular
	.module('gj.Form')
	.directive('gjFormCurrencyInput', function(currencyFilter) {
		var CURRENCY_REGEXP = /^[0-9]*(?:\.[0-9]{0,2})?$/;

		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, elem, attr, ngModel) {
				ngModel.$validators.currency = function(modelVal, viewVal) {
					var val = modelVal || viewVal;
					return ngModel.$isEmpty(val) || CURRENCY_REGEXP.test(val);
				};
			},
		};
	});
