import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';
import { AppWidgetCompiler } from '../widget-compiler';

export class WidgetCompilerWidgetUserBio extends WidgetCompilerWidget {
	readonly name = 'user-bio';

	compile(context: WidgetCompilerContext, _params: string[] = []) {
		return this.wrapComponent(AppWidgetCompiler, () => {
			return {
				content: context['user'] && context['user'].description_compiled,
			};
		});
	}
}
