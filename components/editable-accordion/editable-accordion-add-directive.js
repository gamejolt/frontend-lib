angular.module( 'gj.EditableAccordion' ).directive( 'gjEditableAccordionAdd', function()
{
	return {
		restrict: 'E',
		transclude: true,
		require: '^gjEditableAccordion',
		templateUrl: '/lib/gj-lib-client/components/editable-accordion/editable-accordion-add.html',
		scope: {
			addLabel: '@'
		},
		link: function( scope, element, attrs, editableAccordion )
		{
			scope.editableAccordion = editableAccordion;

			// Just forward on to the editable accordion controller.
			scope.toggle = function()
			{
				editableAccordion.toggleIsAdding();
			};
		}
	};
} );
