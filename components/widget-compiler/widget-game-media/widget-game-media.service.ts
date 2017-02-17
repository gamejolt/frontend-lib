import { WidgetCompilerWidget } from '../widget';
import { AppMediaBar } from '../../media-bar/media-bar';
import { WidgetCompilerContext } from '../widget-compiler.service';

export class WidgetCompilerWidgetGameMedia extends WidgetCompilerWidget
{
	readonly name = 'game-media';

	compile( context: WidgetCompilerContext, params: string[] = [] )
	{
		const namedParams = this.namedParams( params );

		return this.wrapComponent( AppMediaBar, () =>
		{
			return {
				mediaItems: (context['mediaItems'] || [])
					.slice( 0, parseInt( namedParams['num'], 10 ) || 6 ),
			};
		} );
	}
}
