import * as Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./widget-game-packages.html';

import { Sellable } from '../../sellable/sellable.model';
import { Environment } from '../../environment/environment.service';

@View
@Component({
	name: 'widget-compiler-widget-game-packages',
})
export class AppWidgetCompilerWidgetGamePackages extends Vue
{
	@Prop( { type: Array, default: [] } ) sellables: Sellable[];

	widgetHost = Environment.widgetHost;
}
