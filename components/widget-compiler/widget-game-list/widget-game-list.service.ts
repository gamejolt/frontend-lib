import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';
import { AppWidgetCompilerWidgetGameList } from './widget-game-list';

export class WidgetCompilerWidgetGameList extends WidgetCompilerWidget
{
	readonly name = 'game-list';

	compile( context: WidgetCompilerContext, _params: string[] = [] )
	{
		return this.wrapComponent( AppWidgetCompilerWidgetGameList, () =>
		{
			return {
				games: context['games'],
			};
		} );
	}
}
