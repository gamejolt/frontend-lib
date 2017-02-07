ContentBlockEditorFormFactory.$inject = [ 'Form' ];
export function ContentBlockEditorFormFactory(
	Form: any,
)
{
	const form = new Form( {
		model: 'SiteContentBlock',
		template: require( './editor-form.component.html' ),
	} );

	form.scope.compiled = '&';

	form.onInit = function( scope: any )
	{
		// Apply updates right away so that the live preview works.
		scope.$watch( 'formModel.content_markdown', ( content: string ) =>
		{
			scope.baseModel.content_markdown = content;
		} );
	};

	return form;
}
