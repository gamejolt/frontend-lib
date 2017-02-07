import { NgModule } from 'ng-metadata/core';

import { GraphTableComponent } from './table.component';
import { GraphWidgetComponent } from './widget.component';
import { GraphComponent } from './graph.component';

@NgModule({
	declarations: [
		GraphTableComponent,
		GraphWidgetComponent,
		GraphComponent,
	],
})
export class GraphModule {
}
