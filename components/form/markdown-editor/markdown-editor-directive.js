angular
	.module('gj.Form.MarkdownEditor')
	.directive('formMarkdownEditor', function(Environment, Screen, Api) {
		return {
			require: ['formMarkdownEditor', '^gjForm', '^formGroup'],
			scope: {
				previewClass: '@',
				editorClass: '@?',
				placeholder: '@?',
				markdownPreviewUrl: '@',
				markdownMode: '@?',
				htmlSupport: '<?',
				isPreviewDisabled: '=?disablePreview',
				showMediaItems: '<?',
				mediaItemType: '@?',
				allowCodeEditor: '<?',
				debounce: '<?',
			},
			template: require('!html-loader!./markdown-editor.html'),
			bindToController: true,
			controllerAs: 'ctrl',
			controller: function($scope) {
				$scope.Screen = Screen;
				$scope.Environment = Environment;

				this.currentTab = 'edit';
				this.editorMode = 'textarea';

				if (!this.markdownMode) {
					this.markdownMode = 'markdown';
				}

				this.shouldShowMarkdownHelp = true;
				this.shouldShowWidgetHelp = false;
				this.markdownHelpUrl = 'markdown';

				if (this.markdownMode == 'comments') {
					this.markdownHelpUrl = 'markdown-comments';
				}

				if (this.markdownMode == 'fireside') {
					this.shouldShowWidgetHelp = true;
				}

				if (this.markdownMode == 'devlog') {
					this.shouldShowWidgetHelp = true;
				}

				if (this.markdownMode == 'jams') {
					this.shouldShowWidgetHelp = true;
				}

				if (this.markdownMode == 'forums') {
					this.shouldShowWidgetHelp = true;
				}

				if (this.markdownMode == 'game-site') {
					this.shouldShowWidgetHelp = true;
				}

				if (this.markdownMode == 'user-site') {
					this.shouldShowWidgetHelp = true;
				}
			},
			link: function(scope, element, attrs, controllers) {
				var _this = controllers[0] || undefined;
				var gjForm = controllers[1] || undefined;
				var formGroup = controllers[2] || undefined;

				_this.formGroup = formGroup;

				if (_this.showMediaItems && !!scope.$parent[gjForm.formModel].id) {
					_this.mediaItemParentId = scope.$parent[gjForm.formModel].id;
				}

				/**
			 * When the tab is changed between Write and Preview.
			 */
				_this.onTabChanged = function() {
					if (_this.currentTab == 'preview') {
						// Get the control's model from the form.
						var content = scope.$parent[gjForm.formModel][formGroup.name];
						if (content) {
							_this.previewContent = '';

							Api.sendRequest(
								_this.markdownPreviewUrl,
								{ content: content },
								{ ignorePayloadUser: true },
							).then(function(response) {
								if (
									response &&
									response.success !== false &&
									response.compiled
								) {
									_this.previewContent = response.compiled;
								}
							});
						} else {
							_this.previewContent = '';
							_this.isLoadingPreview = false;
						}
					}
				};

				// Pull from the parent form model whether it has content or not.
				_this.hasContent = function() {
					return !!scope.$parent[gjForm.formModel][formGroup.name];
				};

				// We watch for when content changes and when it does we make sure
				// we're in "edit" mode.
				scope.$watch(
					function() {
						return scope.$parent[gjForm.formModel][formGroup.name];
					},
					function(content) {
						_this.previewContent = '';
						_this.currentTab = 'edit';
					},
				);

				_this.codemirrorChange = function(newContent) {
					scope.$parent[gjForm.formModel][formGroup.name] = newContent;
				};
			},
		};
	})
	/**
 * We need to do this so that we can compile the name and the ID into the form control.
 * This is needed since "name" isn't currently watchable by angular.
 */
	.directive('formMarkdownEditorControl', function($compile, $timeout) {
		return {
			priority: 1000,
			terminal: true,
			restrict: 'A',
			require: ['^gjForm', '^formGroup'],
			link: {
				post: function(scope, element, attrs, controllers) {
					var gjForm = controllers[0] || undefined;
					var formGroup = controllers[1] || undefined;
					var type = attrs.formMarkdownEditorControl;

					// Remove this directive so that we don't go in an infinite loop.
					element.removeAttr('form-markdown-editor-control');

					// Set the ID/name from the form group data.
					element[0].setAttribute('name', formGroup.name);

					if (type === 'textarea') {
						// Set the ng-model variable for the form field.
						// Since the markdown editor is an isolate scope, we have to pull from the parent.
						element[0].setAttribute(
							'ng-model',
							'$parent.$parent["' +
								gjForm.formModel +
								'"]["' +
								formGroup.name +
								'"]',
						);

						// Server validation errors.
						element[0].setAttribute(
							'gj-form-server-validation',
							'formState.serverErrors',
						);
					} else if (type === 'codemirror') {
						element[0].setAttribute(
							'value',
							'{{ $parent.$parent["' +
								gjForm.formModel +
								'"]["' +
								formGroup.name +
								'"] }}',
						);
						element[0].setAttribute(
							'changed',
							'ctrl.codemirrorChange( $event )',
						);
					}

					// Recompile the element with the new attributes.
					$compile(element)(scope);
				},
			},
		};
	});
