import { Injectable, Inject } from 'ng-metadata/core';
import { WidgetCompilerWidget } from '../widget';

const TEMPLATE = `
	<div ng-if="mediaItems.length">
		<gj-media-bar media-items="mediaItems"></gj-media-bar>
	</div>
`;

@Injectable()
export class WidgetCompilerWidgetGameMedia implements WidgetCompilerWidget
{
	readonly name = 'game-media';

	mediaItems: any[];

	constructor(
		@Inject( '$compile' ) private $compile: ng.ICompileService,
	)
	{
	}

	compile( scope: ng.IScope, _params: any[] = [] )
	{
		scope.$watchGroup( [
			'$parent.mediaItems',
		],
		( [ mediaItems ] ) =>
		{
			angular.extend( scope, { mediaItems } );
		} );

		return this.$compile( TEMPLATE )( scope );
	}
}
