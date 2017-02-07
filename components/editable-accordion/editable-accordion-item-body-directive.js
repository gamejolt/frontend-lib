angular.module( 'gj.EditableAccordion' ).directive( 'gjEditableAccordionItemBody', function()
{
	return {
		restrict: 'E',
		transclude: true,
		require: [ '^gjEditableAccordion', '^gjEditableAccordionItem' ],
		template: require( '!html-loader!./editable-accordion-item-body.html' ),
		scope: {},
		link: function( scope, element, attrs, ctrls )
		{
			var accordion = ctrls[0];
			var item = ctrls[1];

			scope.accordion = accordion;
			scope.item = item;

			// Set our item as expandable since it has a body element.
			item.notExpandable = false;
		}
	};
} );
