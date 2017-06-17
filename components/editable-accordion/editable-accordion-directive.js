angular
	.module('gj.EditableAccordion')
	.directive('gjEditableAccordion', function() {
		return {
			restrict: 'E',
			scope: {
				isAdding: '=?',
				activeItem: '=?',
			},
			compile: function(element) {
				element.addClass('editable-accordion');
			},
			controller: function($scope) {
				var _this = this;

				this.items = [];
				this.incrementer = 0;
				this.isAdding = false;
				this.activeItem = null;

				$scope.$watch('isAdding', function(isAdding) {
					_this.isAdding = isAdding;
				});

				$scope.$watch('activeItem', function(activeItem) {
					_this.activeItem = activeItem;
				});

				this.toggleIsAdding = function(status) {
					// Change the scope variable, which will trigger the watch and set our local isAdding variable.
					if (angular.isUndefined(status)) {
						$scope.isAdding = !this.isAdding;
					} else {
						$scope.isAdding = status;
					}

					$scope.activeItem = null;
				};

				this.registerItem = function(id) {
					if (!id) {
						++this.incrementer;
						id = this.incrementer;
					}
					this.items.push(id);
					return id;
				};

				this.deregisterItem = function(id) {
					_.remove(this.items, id);

					// If this was the currently active item...
					if ($scope.activeItem == id) {
						$scope.activeItem = null;
					}
				};

				this.setActiveItem = function(id) {
					$scope.isAdding = false;
					$scope.activeItem = id;
				};
			},
		};
	});
