angular.module('gj.Form').directive('gjFormServerValidation', function() {
	// Don't create a new scope.
	// This allows it to work with other directives.
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, elem, attr, ngModel) {
			/**
			 * Any time the server response updates, check to see if this form control is invalid.
			 * If it is, we set it as invalid.
			 */
			scope.$watchCollection(attr.gjFormServerValidation, function(
				serverResponse,
			) {
				if (serverResponse) {
					if (
						angular.isDefined(attr.name) &&
						angular.isDefined(serverResponse[attr.name])
					) {
						// Set the 'server' key as invalid.
						// This is a generic key saying that the server rejected the value.
						ngModel.$setValidity('server', false);

						// We set the model as dirty.
						// This will force show the server error message since it thinks that it's invalid
						// and the value has changed.
						ngModel.$setDirty();
					}
				}
			});

			/**
			 * Any time the value of the input changes, simply set the validity back to true.
			 * This clears out the server error whenever they change it.
			 */
			ngModel.$viewChangeListeners.push(function() {
				if (angular.isDefined(ngModel.$error.server) && ngModel.$error.server) {
					ngModel.$setValidity('server', true);

					// Clear out the actual error from the serverErrors object now that we've dealt with it.
					if (angular.isDefined(scope[attr.gjFormServerValidation])) {
						if (
							angular.isDefined(attr.name) &&
							angular.isDefined(scope[attr.gjFormServerValidation][attr.name])
						) {
							delete scope[attr.gjFormServerValidation][attr.name];
						}
					}
				}
			});
		},
	};
});
