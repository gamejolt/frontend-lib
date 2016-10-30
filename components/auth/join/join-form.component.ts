export function AuthJoinFormFactory( Api: any, Form: any, Connection: any )
{
	const form = new Form( {
		template: '/lib/gj-lib-client/components/auth/join/join-form.component.html',
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
