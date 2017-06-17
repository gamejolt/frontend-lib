angular
	.module('gj.Form')
	.directive('formControl', function($compile) {
		// Since they get set as ng-pattern attributes, we have to double backslash.
		var _patterns = {
			// Alphanumeric, hyphens.
			urlPath: /^[\w\-]+$/,

			domain: /^((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}$/,

			// Alphanumeric, underscores.
			hashtag: /^[\w\_]+$/,

			// Alphanumeric, underscores, hyphens.
			username: /^[\w\-]+$/,

			// GA Tracking ID
			gaTrackingId: /^UA\-[0-9]+\-[0-9]+$/,

			// Semver version strings
			// https://github.com/sindresorhus/semver-regex/blob/master/index.js
			semver: /^v?(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?$/i,
		};

		return {
			priority: 1000,
			terminal: true,
			restrict: 'A',
			require: ['^gjForm', '^formGroup'],
			compile: function(element, attrs) {
				// Certain elements don't get the form-control class.
				var addControlClass = false;

				if (
					attrs.formControl &&
					['radio', 'checkbox', 'file', 'upload', 'crop'].indexOf(
						attrs.formControl,
					) === -1
				) {
					addControlClass = true;
				} else if (!attrs.formControl) {
					addControlClass = true;
				}

				if (addControlClass) {
					element.addClass('form-control');
				}

				// If the form control attribute had a value, then that's the input type.
				// Let's pull it and set it on the element as a type.
				if (
					attrs.formControl &&
					attrs.formControl != 'upload' &&
					attrs.formControl != 'crop'
				) {
					element.attr('type', attrs.formControl);
				}

				// Remove this directive so that we don't go in an infinite loop.
				element.removeAttr('form-control');

				// Add the compiled directive. This is where the logic will live for the actual form control.
				element.attr('form-control-compiled', true);

				// Bind to our isRequired attribute.
				// Checkboxes can't have this set.
				if (attrs.formControl != 'checkbox') {
					element.attr('ng-required', 'isRequired');
				}

				// Bind to our server errors variable if there is none set.
				// Defaults to "serverErrors".
				if (!attrs.gjFormServerValidation) {
					element.attr('gj-form-server-validation', 'formState.serverErrors');
				}

				return {
					post: function(scope, element, attrs, controllers) {
						var gjForm = controllers[0];
						var formGroup = controllers[1];

						// Whether or not we should add an ID to this control.
						// We don't add to inputs that will be repeated for the same model.
						var shouldAddId = true;
						if (['radio', 'checkbox'].indexOf(attrs.type) !== -1) {
							shouldAddId = false;
						}

						// Apply the correct ID and name.
						// These don't get watched as angular can't handle them updating.
						// Name is also required to be set before it's all compiled.
						if (shouldAddId) {
							element.attr('id', gjForm.name + '-' + formGroup.name);
						}
						element.attr('name', formGroup.name);

						// If no ng-model is defined, then let's define one ourself.
						// Take the form model name and attach the group's name.
						if (angular.isUndefined(attrs.ngModel)) {
							element.attr(
								'ng-model',
								gjForm.formModel + "['" + formGroup.name + "']",
							);
						}

						if (angular.isDefined(attrs.ngMaxlength)) {
							formGroup.setValidationData('maxlength', attrs.ngMaxlength);
						}

						if (angular.isDefined(attrs.ngMinlength)) {
							formGroup.setValidationData('minlength', attrs.ngMinlength);
						}

						if (angular.isDefined(attrs.gjFormValidateAvailability)) {
							formGroup.setValidationData('available', true);
						}

						// Was a pattern set?
						if (angular.isDefined(attrs.gjPattern)) {
							if (angular.isDefined(_patterns[attrs.gjPattern])) {
								element.attr('ng-pattern', _patterns[attrs.gjPattern]);
								formGroup.setValidationData('pattern', attrs.gjPattern);
							}
						}

						// Recompile the element with the new attributes.
						$compile(element)(scope);
					},
				};
			},
		};
	})
	.directive('formControlCompiled', function() {
		return {
			restrict: 'A',
			require: ['^gjForm', '^formGroup'],
			link: function(scope, element, attrs, controllers) {
				var gjForm = controllers[0];
				var formGroup = controllers[1];

				/**
			 * Watch to see if the isRequired field changes on the form group.
			 * If it does, then we have to update our scope variable.
			 */
				scope.$watch(
					function(scope) {
						return formGroup.isRequired;
					},
					function(isRequired) {
						scope.isRequired = isRequired;
					},
				);
			},
		};
	});
