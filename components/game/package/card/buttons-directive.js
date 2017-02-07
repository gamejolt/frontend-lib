angular.module( 'gj.Game.Package.Card' ).directive( 'gjGamePackageCardButtons', function()
{
	return {
		restrict: 'E',
		require: '^gjGamePackageCard',
		scope: true,
		template: require( '!html-loader!./buttons.html' ),
	};
} );
