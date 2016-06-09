angular.module( 'gj.User.LinkedAccounts' ).service( 'User_LinkedAccounts', function( $window, $q, $state, Environment, Api, App, Growls )
{
	var _this = this;

	this.login = function( provider )
	{
		// Client flow is a bit different...
		if ( Environment.isClient ) {
			return this.loginClient( provider );
		}

		// Force POST.
		return Api.sendRequest( '/web/auth/' + provider, {} ).then( function( response )
		{
			$window.location = response.redirectLocation;
		} );
	};

	this.loginClient = function( provider )
	{
		// Force POST.
		return Api.sendRequest( '/web/auth/' + provider + '?client', {} ).then( function( response )
		{
			// Gotta open a browser window for them to complete the sign up/login.
			nw.Shell.openExternal( response.redirectLocation );

			// Now redirect them to the page that will continuously check if they are authed yet.
			// We pass in the request token returned since this is what tells us our oauth state.
			$state.go( 'auth.linked-account.poll', { token: response.token } );
		} );
	};

	this.link = function( provider )
	{
		// Client flow is a bit different...
		if ( Environment.isClient ) {
			return this.linkClient( provider );
		}

		// Force POST.
		return Api.sendRequest( '/web/dash/linked-accounts/link/' + provider, {} ).then( function( response )
		{
			$window.location = response.redirectLocation;
		} );
	};

	this.linkClient = function( provider )
	{
		// Force POST.
		return Api.sendRequest( '/web/dash/linked-accounts/link/' + provider + '?client', {} ).then( function( response )
		{
			// Gotta open a browser window for them to complete the sign up/login.
			nw.Shell.openExternal( response.nw );

			// Now redirect them to the page that will continuously check if they are linked yet.
			// We pass in the request token returned since this is what tells us our oauth state.
			$state.go( 'dashboard.account.linked-accounts.linking', { token: response.token } );
		} );
	};

	this.unlink = function( provider )
	{
		var providerUpper;

		if ( provider == 'twitter' ) {
			providerUpper = 'Twitter';
		}
		else if ( provider == 'facebook' ) {
			providerUpper = 'Facebook';
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
