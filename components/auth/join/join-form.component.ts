import { Api } from '../../api/api.service';

AuthJoinFormFactory.$inject = [ 'Form', 'Connection' ];
export function AuthJoinFormFactory( Form: any, Connection: any )
{
	const form = new Form( {
		template: require( './join-form.component.html' ),
	} );

	form.scope.darkVariant = '<';

	form.onInit = function( scope: any )
	{
		scope.Connection = Connection;
	};

	form.onSubmit = function( scope: any )
	{
		return Api.sendRequest( '/web/auth/join', scope.formModel );
	};

	return form;
}
