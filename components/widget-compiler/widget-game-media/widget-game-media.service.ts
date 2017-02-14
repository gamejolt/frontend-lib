import { WidgetCompilerWidget } from '../widget';
import { AppMediaBar } from '../../media-bar/media-bar';
import { WidgetCompilerContext } from '../widget-compiler.service';

export class WidgetCompilerWidgetGameMedia extends WidgetCompilerWidget
{
	readonly name = 'game-media';

	compile( context: WidgetCompilerContext, _params: any[] = [] )
	{
		return this.wrapComponent( AppMediaBar, () =>
		{
			return {
				mediaItems: context['mediaItems'],
			};
		} );
	}
}
