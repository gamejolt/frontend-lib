angular.module( 'gj.User' ).factory( 'User', function( Api, Model )
{
	function User( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		if ( this.type == User.TYPE_GAMER ) {
			this.is_gamer = true;
		}
		else if ( this.type == User.TYPE_DEVELOPER ) {
			this.is_developer = true;
		}
	}

	User.TYPE_GAMER = 'User';
	User.TYPE_DEVELOPER = 'Developer';

	User.touch = function()
	{
		return Api.sendRequest( '/web/touch' );
	};

	User.prototype.$save = function()
	{
		// You can only save yourself, so we don't pass in an ID to the endpoint.
		return this.$_save( '/web/dash/profile/save', 'user' );
	};

	User.prototype.$saveEmailPreferences = function()
	{
		// You can only save yourself, so we don't pass in an ID to the endpoint.
		return this.$_save( '/web/dash/email-preferences/save', 'user' );
	};

	User.prototype.$saveFireside = function()
	{
		return this.$_save( '/fireside/dash/profile/save', 'user' );
	};

	User.prototype.$saveFiresideSettings = function()
	{
		return this.$_save( '/fireside/dash/settings/save', 'user' );
	};

	User.prototype.$unlinkAccount = function( provider )
	{
		return this.$_save( '/web/dash/linked-accounts/unlink/' + provider, 'user' );
	};

	return Model.create( User );
} );
