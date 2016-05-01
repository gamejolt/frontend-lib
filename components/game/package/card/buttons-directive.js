angular.module( 'gj.Game.Package.Card' ).directive( 'gjGamePackageCardButtons', function()
{
	return {
		restrict: 'E',
		require: '^gjGamePackageCard',
		scope: true,
		templateUrl: '/lib/gj-lib-client/components/game/package/card/buttons.html',
	};
} );
