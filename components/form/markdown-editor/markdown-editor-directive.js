angular.module( 'gj.Form.MarkdownEditor' ).directive( 'formMarkdownEditor', function( Environment, Screen, Api )
{
	return {
		require: [ 'formMarkdownEditor', '^gjForm', '^formGroup' ],
		scope: {
			previewClass: '@',
			editorClass: '@?',
			placeholder: '@?',
			markdownPreviewUrl: '@',
			markdownMode: '@?',
			isPreviewDisabled: '=?disablePreview',
		},
		templateUrl: '/lib/gj-lib-client/components/form/markdown-editor/markdown-editor.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope )
		{
			$scope.Screen = Screen;
			$scope.Environment = Environment;

			this.currentTab = 'edit';

			if ( !this.markdownMode ) {
				this.markdownMode = 'markdown';
			}

			this.shouldShowMarkdownHelp = true;
			this.shouldShowWidgetHelp = false;
			this.markdownHelpUrl = 'markdown';

			if ( this.markdownMode == 'comments' ) {
				this.markdownHelpUrl = 'markdown-comments';
			}

			if ( this.markdownMode == 'fireside' ) {
				this.shouldShowWidgetHelp = true;
			}

			if ( this.markdownMode == 'jams' ) {
				this.shouldShowWidgetHelp = true;
			}

			if ( this.markdownMode == 'forums' ) {
				this.shouldShowWidgetHelp = true;
			}
		},
		link: function( scope, element, attrs, controllers )
		{
			var _this = controllers[0] || undefined;
			var gjForm = controllers[1] || undefined;
			var formGroup = controllers[2] || undefined;

			_this.formGroup = formGroup;

			/**
			 * When the tab is changed between Write and Preview.
			 */
			_this.onTabChanged = function()
			{
				if ( _this.currentTab == 'preview' ) {

					// Get the control's model from the form.
					var content = scope.$parent[ gjForm.formModel ][ formGroup.name ];
					if ( content ) {

						_this.previewContent = '';

						Api.sendRequest( _this.markdownPreviewUrl, { content: content }, { ignorePayloadUser: true } )
							.then( function( response )
							{
								if ( response && response.success !== false && response.compiled ) {
									_this.previewContent = response.compiled;
								}
							} );
					}
					else {
						_this.previewContent = '';
						_this.isLoadingPreview = false;
					}
				}
			};

			// Pull from the parent form model whether it has content or not.
			_this.hasContent = function()
			{
				return !!scope.$parent[ gjForm.formModel ][ formGroup.name ];
			};

			// We watch for when content changes and when it does we make sure
			// we're in "edit" mode.
			scope.$watch( function()
			{
				return scope.$parent[ gjForm.formModel ][ formGroup.name ];
			},
			function( content )
			{
				_this.previewContent = '';
				_this.currentTab = 'edit';
			} );
		}
	};
} )
/**
 * We need to do this so that we can compile the name and the ID into the form control.
 * This is needed since "name" isn't currently watchable by angular.
 */
.directive( 'formMarkdownEditorControl', function( $compile, $timeout )
{
	return {
		priority: 1000,
		terminal: true,
		restrict: 'A',
		require: [ '^gjForm', '^formGroup' ],
		link: {
			post: function( scope, element, attrs, controllers )
			{
				var gjForm = controllers[0] || undefined;
				var formGroup = controllers[1] || undefined;

				// Remove this directive so that we don't go in an infinite loop.
				element.removeAttr( 'form-markdown-editor-control' );

				// Set the ID/name from the form group data.
				element.attr( 'name', formGroup.name );

				// Set the ng-model variable for the form field.
				// Since the markdown editor is an isolate scope, we have to pull from the parent.
				element.attr( 'ng-model', '$parent.$parent["' + gjForm.formModel + '"]["' + formGroup.name + '"]' );

				// Server validation errors.
				element.attr( 'gj-form-server-validation', 'serverErrors' );

				// Recompile the element with the new attributes.
				$compile( element )( scope );
			}
		}
	};
} );

