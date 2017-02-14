import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';
import { AppWidgetCompilerWidgetGamePackages } from './widget-game-packages';

export class WidgetCompilerWidgetGamePackages extends WidgetCompilerWidget
{
	readonly name = 'game-packages';

	compile( context: WidgetCompilerContext, _params: any[] = [] )
	{
		return this.wrapComponent( AppWidgetCompilerWidgetGamePackages, () =>
		{
			return {
				sellables: context['sellables'],
			};
		} );
	}
}
