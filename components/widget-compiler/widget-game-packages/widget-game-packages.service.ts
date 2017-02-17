import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';
import { AppWidgetCompilerWidgetGamePackages } from './widget-game-packages';

export class WidgetCompilerWidgetGamePackages extends WidgetCompilerWidget
{
	readonly name = 'game-packages';

	compile( context: WidgetCompilerContext, params: string[] = [] )
	{
		const namedParams = this.namedParams( params );

		return this.wrapComponent( AppWidgetCompilerWidgetGamePackages, () =>
		{
			return {
				sellables: context['sellables'],
				theme: namedParams['theme'] || 'dark',
			};
		} );
	}
}
