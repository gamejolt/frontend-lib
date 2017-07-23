import Vue from 'vue';
import { WidgetCompilerWidget } from '../widget';
import { WidgetCompilerContext } from '../widget-compiler.service';
import { AppWidgetCompilerWidgetGameMedia } from './widget-game-media';

export class WidgetCompilerWidgetGameMedia extends WidgetCompilerWidget {
	readonly name = 'game-media';

	compile(h: Vue.CreateElement, context: WidgetCompilerContext, params: string[] = []) {
		const namedParams = this.namedParams(params);

		return h(AppWidgetCompilerWidgetGameMedia, {
			props: {
				items: context['mediaItems'] || [],
				num: parseInt(namedParams['num'], 10) || 6,
			},
		});
	}
}
