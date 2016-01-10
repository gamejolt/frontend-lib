angular.module( 'gj.User.LinkedAccounts' ).service( 'User_LinkedAccounts', function( $window, $q, Api, App, Growls )
{
	var _this = this;

	this.login = function( provider )
	{
		// Force POST.
		return Api.sendRequest( '/web/auth/' + provider, {} ).then( function( response )
		{
			$window.location = response.redirectLocation;
		} );
	};

	this.link = function( provider )
	{
		// Force POST.
		return Api.sendRequest( '/web/dash/linked-accounts/link/' + provider, {} ).then( function( response )
		{
			$window.location = response.redirectLocation;
		} );
	};

	this.unlink = function( provider )
	{
		if ( provider == 'twitter' ) {
			var providerUpper = 'Twitter';
		}
		else if ( provider == 'facebook' ) {
			var providerUpper = 'Facebook';
		}

		return App.user.$unlinkAccount( provider ).then( function( response )
		{
			Growls.success( 'Your ' + providerUpper + ' account has been unlinked from the site.', 'Account Unlinked' );
		} )
		.catch( function( response )
		{
			if ( !response || !response.success ) {
				if ( response.reason && response.reason == 'no-password' ) {
					return $q.reject( response.reason );
				}
			}

			Growls.error( 'Could not unlink your ' + providerUpper + ' account.' );
			return $q.reject();
		} );
	};
} );
