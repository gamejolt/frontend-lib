import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';
import { AppWidgetCompiler } from '../widget-compiler';

export class WidgetCompilerWidgetGameDescription extends WidgetCompilerWidget
{
	readonly name = 'game-description';

	compile( context: WidgetCompilerContext, _params: string[] = [] )
	{
		return this.wrapComponent( AppWidgetCompiler, () =>
		{
			return {
				content: context['game'] && context['game'].description_compiled,
			};
		} );
	}
}
