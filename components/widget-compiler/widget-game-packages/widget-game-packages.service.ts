import { Injectable, Inject } from 'ng-metadata/core';
import { WidgetCompilerWidget } from '../widget';

const TEMPLATE = `
	<div ng-if="game && packages">
		<gj-game-package-card
			ng-repeat="package in packages"
			game="::game"
			sellable="::package._sellable"
			game-package="::package"
			game-releases="::package._releases"
			game-builds="::package._builds"
			>
		</gj-game-package-card>
	</div>
`;

@Injectable()
export class WidgetCompilerWidgetGamePackages implements WidgetCompilerWidget
{
	readonly name = 'game-packages';

	constructor(
		@Inject( '$compile' ) private $compile: ng.ICompileService,
	)
	{
	}

	compile( scope: ng.IScope, _params: any[] = [] )
	{
		scope.$watchGroup( [
			'$parent.game',
			'$parent.packages',
		],
		( [ game, packages ] ) =>
		{
			angular.extend( scope, { game, packages } );
		} );

		return this.$compile( TEMPLATE )( scope );
	}
}
