angular.module( 'gj.Game.Package.Card' ).directive( 'gjGamePackageCardMoreOptions', function()
{
	return {
		restrict: 'E',
		require: '^gjGamePackageCard',
		scope: true,
		templateUrl: '/lib/gj-lib-client/components/game/package/card/more-options.html',
	};
} );
