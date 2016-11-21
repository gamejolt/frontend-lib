export function AuthLoginFormFactory( Api: any, Form: any, Connection: any )
{
	const form = new Form( {
		template: '/lib/gj-lib-client/components/auth/login/login-form.component.html',
	} );

	form.scope.darkVariant = '<';

	form.onInit = function( scope: any )
	{
		scope.Connection = Connection;

		scope.keyup = () =>
		{
			scope.resetErrors();
		};

		scope.resetErrors = () =>
		{
			scope.formState.invalidLogin = false;
			scope.formState.blockedLogin = false;
		};

		scope.resetErrors();
	};

	form.onSubmit = function( scope: any )
	{
		scope.resetErrors();

		return Api.sendRequest( '/web/auth/login', scope.formModel ).then( ( response: any ) =>
		{
			if ( response.success === false ) {
				if ( response.reason ) {
					if ( response.reason == 'invalid-login' ) {
						scope.formState.invalidLogin = true;
					}
					else if ( response.reason == 'blocked' ) {
						scope.formState.blockedLogin = true;
					}
				}
			}

			return response;
		} );
	};

	return form;
}
