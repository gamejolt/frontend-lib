import { Injectable, Inject } from 'ng-metadata/core';
import { WidgetCompilerWidget } from './widget';

const TEMPLATE = `
	<gj-widget-compiler-widget-vimeo
		video-id="videoId"
		>
	</gj-widget-compiler-widget-vimeo>
`;

@Injectable()
export class WidgetCompilerWidgetVimeo implements WidgetCompilerWidget
{
	readonly name = 'vimeo';

	constructor(
		@Inject( '$compile' ) private $compile: ng.ICompileService,
	)
	{
	}

	compile( scope: ng.IScope, params: any[] = [] )
	{
		if ( !params || !params.length ) {
			throw new Error( `Invalid params for widget.` );
		}

		scope['videoId'] = params[0];

		return this.$compile( TEMPLATE )( scope );
	}
}
