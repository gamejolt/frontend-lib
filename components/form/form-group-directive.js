angular
	.module('gj.Form')
	.directive('formGroup', function($interpolate, $parse) {
		/**
	 * Convert a name to title case.
	 * jam_hashtag, jamHashtag, jam-hashtag all become Jam Hashtag
	 */
		function nameToTitleCase(str) {
			// Hyphen and underscore.
			str = str.replace(/(\-|_)/g, ' ');

			// camelCase.
			str = str.replace(/([a-z])([A-Z])/g, '$1 $2');

			// Uppercase words.
			return str.replace(/\w\S*/g, function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}

		return {
			restrict: 'EA',
			require: ['^gjForm', 'formGroup'],
			scope: true,
			transclude: true,
			template: require('!html-loader!./form-group.html'),
			controller: function($scope, $attrs) {
				this.name = undefined;
				this.label = undefined;
				this.isRequired = true;
				this.hideLabel = false;
				this.labelClass = '';
				this.labelClasses = [];

				this.validationData = {};

				this.setValidationData = function(validation, data) {
					this.validationData[validation] = data;
				};

				this.removeValidationData = function(validation) {
					delete this.validationData[validation];
				};
			},
			controllerAs: 'formGroupCtrl',
			link: function(scope, element, attrs, controllers, transclude) {
				var gjFormCtrl = controllers[0];
				var formGroupCtrl = controllers[1];

				element.addClass('form-group');

				// Do a single interpolation of the name and store it.
				// This way we can do dynamic names. It'll be statically applied for the form input element, though.
				formGroupCtrl.name = $interpolate(attrs.name)(scope);

				// Transclude it manually so we don't have superfluous DIVs to transclude into.
				// If we add extra divs, we may end up adding extra space or ruining styling rules.
				transclude(function(clone) {
					element.append(clone);
				});

				// If we couldn't find a label attribute, just make one up from the name.
				// Otherwise interpolate.
				if (angular.isUndefined(attrs.label)) {
					formGroupCtrl.label = nameToTitleCase(formGroupCtrl.name);
				} else {
					attrs.$observe('label', function(val) {
						formGroupCtrl.label = val;
					});
				}

				/**
			 * Watch for any changes to the "optional" expression.
			 * If it evaluates to true, then the element is not required.
			 */
				scope.$watch($parse(attrs.optional), function(val) {
					if (angular.isDefined(val)) {
						formGroupCtrl.isRequired = !val;
					} else {
						formGroupCtrl.isRequired = true;
					}

					if (!formGroupCtrl.isRequired) {
						element.addClass('optional');
					} else {
						element.removeClass('optional');
					}
				});

				/**
			 * Watch for any changes to the "hide-label" expression.
			 */
				scope.$watch($parse(attrs.hideLabel), function(val) {
					if (val) {
						formGroupCtrl.hideLabel = true;
					} else {
						formGroupCtrl.hideLabel = false;
					}
					updateLabelClass();
				});

				if (angular.isDefined(attrs.labelClass)) {
					attrs.$observe('labelClass', function(val) {
						formGroupCtrl.labelClasses = val.split(' ');
						updateLabelClass();
					});
				}

				function updateLabelClass() {
					var classes = [];
					if (formGroupCtrl.hideLabel) {
						classes.push('sr-only');
					}

					classes = classes.concat(formGroupCtrl.labelClasses);
					classes = _.uniq(classes);

					formGroupCtrl.labelClass = classes.join(' ');
				}
			},
		};
	});
