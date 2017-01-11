import { Injectable, Inject } from 'ng-metadata/core';
import { WidgetCompilerWidget } from '../widget';

const TEMPLATE = `
	<div gj-widget-compiler-bind="game.description"></div>
`;

@Injectable()
export class WidgetCompilerWidgetGameDescription implements WidgetCompilerWidget
{
	readonly name = 'game-description';

	constructor(
		@Inject( '$compile' ) private $compile: ng.ICompileService,
	)
	{
	}

	compile( scope: ng.IScope, _params: any[] = [] )
	{
		scope.$watchGroup( [
			'$parent.game',
		],
		( [ game ] ) =>
		{
			angular.extend( scope, { game } );
		} );

		return this.$compile( TEMPLATE )( scope );
	}
}
