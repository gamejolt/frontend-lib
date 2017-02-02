angular.module( 'gj.Game.Package.Card' ).directive( 'gjGamePackageCardMoreOptions', function()
{
	return {
		restrict: 'E',
		require: '^gjGamePackageCard',
		scope: true,
		template: require( '!html-loader!./more-options.html' ),
	};
} );
