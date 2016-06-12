angular.module( 'gj.Alert.Dismissable' ).component( 'gjAlertDismissable', {
	templateUrl: '/lib/gj-lib-client/components/alert/dismissable/dismissable.html',
	bindings: {
		alertType: '@',
		dismissKey: '@',
		noMargin: '<',
	},
	transclude: true,
	controller: function()
	{
		var STORAGE_KEY_PREFIX = 'dismiss-alert:';

		this.shouldShow = false;

		if ( !localStorage.getItem( STORAGE_KEY_PREFIX + this.dismissKey ) ) {
			this.shouldShow = true;
		}

		this.dismiss = function()
		{
			localStorage.setItem( STORAGE_KEY_PREFIX + this.dismissKey, '1' );
			this.shouldShow = false;
		};
	},
} );
