angular.module( 'gj.Form' ).directive( 'gjForm', function()
{
	return {
		restrict: 'EA',
		require: [ 'gjForm', 'form' ],
		controller: function( $scope, $element, $attrs )
		{
			// Make sure the browser doesn't do its own validation.
			$attrs.$set( 'novalidate', 'novalidate' );

			// Store the name of the form.
			this.name = $attrs.name;

			// Store the model name for this form.
			// We don't need the actual object/model, just the name.
			this.formModel = $attrs.gjForm;
		},
		controllerAs: 'gjFormCtrl',
		link: function( scope, element, attrs, controllers )
		{
			var formCtrl = controllers[1];

			// After successful submit of the form, we set the form to a pristine state.
			scope.$on( 'gjForm.onSubmitted', function()
			{
				formCtrl.$setPristine();
			} );
		}
	};
} );
