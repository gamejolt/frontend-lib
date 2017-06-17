/**
 * TODO: Make this more efficient. It currently ng-repeats every possible error message.
 */
angular
	.module('gj.Form')
	.directive('controlErrors', function($filter, $timeout) {
		// These are default messages that don't need any extra validation data.
		// They are also common enough to be applied to all elements.
		var errorMessagesBase = {
			required: 'You must enter a {}.',
			server: "The {} you've entered is invalid.",
			pattern: 'Please enter a valid {}.',
			url: 'Please enter a valid URL.',
			filetype: 'The chosen {} is the wrong type of file.',
			email: 'Please enter a valid email address.',
			number: 'Please enter a valid number.',
			currency: 'Please enter a valid amount.',
			min: 'The {} entered is too low.',
			max: 'The {} entered is too high.',
		};

		return {
			restrict: 'EA',
			require: ['^form', '^formGroup', 'controlErrors'],
			transclude: true,
			template: require('!html-loader!./control-errors.html'),
			bindToController: {
				labelInput: '@label',
				position: '@',
				ignoreDirty: '=',
			},
			scope: {},
			controllerAs: 'ctrl',
			controller: function($scope) {
				var _this = this;

				this.ngForm = null;
				this.formGroup = null;

				this.label = '';
				this.errorMessageOverrides = {};

				this.setMessageOverride = function(when, message) {
					this.errorMessageOverrides[when] = message;
					updateErrorMessages();
				};

				// We synchronize a reference to the form validation errors and stuff.
				var formFieldWatcher = $scope.$watch(
					function() {
						return _this.ngForm[_this.formGroup.name];
					},
					function(formField) {
						if (formField) {
							_this.ngFormField = formField;

							// Stop watching as soon as we capture it.
							formFieldWatcher();
						}
					},
				);

				/**
			 * Set up the watch on the interpolated label attribute on this directive.
			 * If no label was set on the directive, then we should pull from the group's label.
			 */
				$scope.$watch('ctrl.labelInput || ctrl.formGroup.label', function(
					newLabel,
				) {
					// If it was from the group watcher, then we need to lowercase it.
					if (_this.labelInput != newLabel) {
						newLabel = newLabel.toLowerCase();
					}

					_this.label = newLabel;
					updateErrorMessages();
				});

				/**
			 * If any of the validation data changes for the form group, then update the error messages.
			 */
				$scope.$watchCollection(
					function() {
						return _this.formGroup.validationData;
					},
					function() {
						updateErrorMessages();
					},
				);

				function updateErrorMessages() {
					if (!_this.label) {
						return;
					}

					var validationData = _this.formGroup.validationData;

					// Copy over from the base error messages passed in.
					_this.errorMessages = angular.copy(errorMessagesBase);

					// Pull from the group's validation data to find out the rest of the messages.
					// When an input has validations like maxlength, we register the attribute's value.
					// This way we can message on it better.
					angular.forEach(validationData, function(data, key) {
						switch (key) {
							case 'maxlength':
								_this.errorMessages[key] =
									'Please enter a {} shorter than or equal to ' +
									$filter('number')(data) +
									' characters.';
								break;

							case 'minlength':
								_this.errorMessages[key] =
									'Please enter a {} longer than or equal to ' +
									$filter('number')(data) +
									' characters.';
								break;

							case 'pattern':
								if (data == 'urlPath') {
									_this.errorMessages['pattern'] =
										'Please use only letters, numbers, and hyphens (-).';
								} else if (data == 'hashtag') {
									_this.errorMessages['pattern'] =
										'Please use only letters, numbers, and underscores (_).';
								} else if (data == 'username') {
									_this.errorMessages['pattern'] =
										'Please use only letters, numbers, hyphens (-), periods (.), and underscores (_).';
								}
								break;

							case 'available':
								_this.errorMessages['available'] = 'This {} is already in use.';
								break;

							case 'filesize':
								_this.errorMessages['filesize'] =
									'The chosen {} exceeds the maximum file size of ' +
									$filter('number')(data / 1024 / 1024) +
									'MB.';
								break;

							case 'width':
							case 'height':
								var width = validationData['width'];
								var height = validationData['height'];

								if (width && height) {
									_this.errorMessages['dimensions'] =
										'The dimensions of your {} must be exactly ' +
										$filter('number')(width) +
										'x' +
										$filter('number')(height) +
										'px.';
								} else if (width) {
									_this.errorMessages['dimensions'] =
										'The width of your {} must be exactly ' +
										$filter('number')(width) +
										'px.';
								} else if (height) {
									_this.errorMessages['dimensions'] =
										'The height of your {} must be exactly ' +
										$filter('number')(height) +
										'px.';
								}
								break;

							case 'min-width':
							case 'min-height':
								var width = validationData['min-width'];
								var height = validationData['min-height'];

								if (width && height) {
									_this.errorMessages['minDimensions'] =
										'What is this, a center for ants!? ' +
										'The dimensions of your {} must be at least ' +
										$filter('number')(width) +
										'x' +
										$filter('number')(height) +
										'px.';
								} else if (width) {
									_this.errorMessages['minDimensions'] =
										'What is this, a center for ants!? ' +
										'The width of your {} must be at least ' +
										$filter('number')(width) +
										'px.';
								} else if (height) {
									_this.errorMessages['minDimensions'] =
										'What is this, a center for ants!? ' +
										'The height of your {} must be at least ' +
										$filter('number')(height) +
										'px.';
								}
								break;

							case 'max-width':
							case 'max-height':
								var width = validationData['max-width'];
								var height = validationData['max-height'];

								if (width && height) {
									_this.errorMessages['maxDimensions'] =
										'Your {} is too large. ' +
										'The dimensions must be no greater than ' +
										$filter('number')(width) +
										'x' +
										$filter('number')(height) +
										'px.';
								} else if (width) {
									_this.errorMessages['maxDimensions'] =
										'Your {} is too wide. ' +
										'The width must be no greater than ' +
										$filter('number')(width) +
										'px.';
								} else if (height) {
									_this.errorMessages['maxDimensions'] =
										'Your {} is too tall. ' +
										'The height must be no greater than ' +
										$filter('number')(height) +
										'px.';
								}
								break;

							case 'ratio':
								_this.errorMessages['ratio'] =
									'Your {} has an incorrect aspect ratio. ' +
									'Its width divided by height must be exactly ' +
									$filter('number')(validationData['ratio']) +
									'.';
								break;

							case 'min-ratio':
								_this.errorMessages['minRatio'] =
									'Your {} has an incorrect aspect ratio. ' +
									'Its width divided by height must be at least ' +
									$filter('number')(validationData['min-ratio']) +
									'.';
								break;

							case 'max-ratio':
								_this.errorMessages['maxRatio'] =
									'Your {} has an incorrect aspect ratio. ' +
									'Its width divided by height must be no greater than ' +
									$filter('number')(validationData['max-ratio']) +
									'.';
								break;
						}
					});

					// If we have any overrides then set them on top.
					_this.errorMessages = angular.extend(
						_this.errorMessages,
						_this.errorMessageOverrides,
					);

					// Now update the error messages and replace the label placeholders.
					angular.forEach(_this.errorMessages, function(errorMessage, i) {
						_this.errorMessages[i] = errorMessage.replace(/\{\}/g, _this.label);
					});
				}
			},
			link: {
				pre: function(scope, element, attrs, ctrls) {
					var controlErrors = ctrls[2];
					controlErrors.ngForm = ctrls[0];
					controlErrors.formGroup = ctrls[1];
				},
			},
		};
	});
