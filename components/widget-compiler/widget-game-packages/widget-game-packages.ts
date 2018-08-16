import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./widget-game-packages.html?style=./widget-game-packages.styl';

import { Sellable } from '../../sellable/sellable.model';
import { Environment } from '../../environment/environment.service';

@View
@Component({})
export class AppWidgetCompilerWidgetGamePackages extends Vue {
	@Prop({ type: Array, default: () => [] })
	sellables!: Sellable[];
	@Prop({ type: String, default: 'dark' })
	theme!: string;

	widgetHost = Environment.widgetHost;
}
