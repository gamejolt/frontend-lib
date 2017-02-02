angular.module( 'gj.EditableAccordion' ).directive( 'gjEditableAccordionItemHeading', function()
{
	return {
		restrict: 'E',
		transclude: true,
		require: [ '^gjEditableAccordion', '^gjEditableAccordionItem' ],
		template: require( '!html-loader!./editable-accordion-item-heading.html' ),
		scope: {},
		link: function( scope, element, attrs, ctrls )
		{
			var accordion = ctrls[0];
			var item = ctrls[1];

			scope.accordion = accordion;
			scope.item = item;
		}
	};
} );
