export function AuthLoginFormFactory( Api: any, Form: any, Connection: any )
{
	const form = new Form( {
		template: '/lib/gj-lib-client/components/auth/login/login-form.component.html',
	} );

	form.scope.darkVariant = '<';

	form.onInit = function( scope: any )
	{
		scope.Connection = Connection;

		scope.formState.invalidLogin = false;
		scope.keyup = () =>
		{
			scope.formState.invalidLogin = false;
		};
	};

	form.onSubmit = function( scope: any )
	{
		return Api.sendRequest( '/web/auth/login', scope.formModel ).then( ( response: any ) =>
		{
			if ( response.success === false ) {
				if ( response.reason && response.reason == 'invalid-login' ) {
					scope.formState.invalidLogin = true;
				}
			}

			return response;
		} );
	};

	return form;
}
