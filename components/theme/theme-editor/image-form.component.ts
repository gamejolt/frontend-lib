import { Api } from '../../api/api.service';
import { Loader } from '../../loader/loader.service';

ThemeEditorImageFormFactory.$inject = [ 'Form' ];
export function ThemeEditorImageFormFactory(
	Form: any,
)
{
	const form = new Form( {
		template: require( './image-form.component.html' ),
		resetOnSubmit: true,
	} );

	form.scope.type = '@';
	form.scope.parentId = '<';

	form.onInit = function( scope: any )
	{
		scope.Loader = Loader;
		Loader.load( 'upload' );

		scope.formState.isLoaded = false;
		scope.formModel.type = scope.type;
		scope.formModel.parent_id = scope.parentId;

		if ( !scope.formState.isLoaded ) {
			Api.sendRequest( '/web/dash/media-items', scope.formModel, { detach: true } )
				.then( ( response: any ) =>
				{
					scope.formState.isLoaded = true;
					scope.maxFilesize = response.maxFilesize;
					scope.maxWidth = response.maxWidth;
					scope.maxHeight = response.maxHeight;
				} );
		}
	};

	form.onSubmit = function( scope: any )
	{
		return Api.sendRequest( '/web/dash/media-items/add-one', scope.formModel, { file: scope.formModel.file } );
	};

	return form;
}
