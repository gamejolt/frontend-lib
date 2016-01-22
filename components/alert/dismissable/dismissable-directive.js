angular.module( 'gj.Alert.Dismissable' ).directive( 'gjAlertDismissable', function()
{
	var STORAGE_KEY_PREFIX = 'dismiss-alert:';

	return {
		templateUrl: '/lib/gj-lib-client/components/alert/dismissable/dismissable.html',
		scope: {
			alertType: '@',
			dismissKey: '@',
		},
		transclude: true,
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function()
		{
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
	};
} );
