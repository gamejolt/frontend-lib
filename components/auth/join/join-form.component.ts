import { Api } from '../../api/api.service';
import { Connection } from '../../connection/connection-service';

AuthJoinFormFactory.$inject = [ 'Form' ];
export function AuthJoinFormFactory( Form: any )
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
