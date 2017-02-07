import { Injectable, Inject } from 'ng-metadata/core';
import { WidgetCompilerWidget } from './widget';

const TEMPLATE = `
	<gj-widget-compiler-widget-soundcloud
		track-id="trackId"
		color="color"
		>
	</gj-widget-compiler-widget-soundcloud>
`;

@Injectable( 'WidgetCompilerWidgetSoundcloud' )
export class WidgetCompilerWidgetSoundcloud implements WidgetCompilerWidget
{
	readonly name = 'soundcloud';

	constructor(
		@Inject( '$compile' ) private $compile: ng.ICompileService,
	)
	{
	}

	compile( scope: ng.IScope, params: any[] )
	{
		if ( !params || !params.length ) {
			throw new Error( `Invalid params for widget.` );
		}

		// Track ID is always first.
		scope['trackId'] = params[0];

		// Then an optional color.
		if ( params[1] ) {
			scope['color'] = params[1].replace( /[^0-9A-Za-z]/g, '' );
		}

		return this.$compile( TEMPLATE )( scope );
	}
}
