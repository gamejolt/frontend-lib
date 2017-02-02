import { Component, Input, OnChanges } from 'ng-metadata/core';
import * as template from '!html-loader!./widget.component.html';

import { Api } from '../api/api.service';
import { Graph } from './graph.service';

@Component({
	selector: 'gj-graph-widget',
	template,
})
export class GraphWidgetComponent implements OnChanges
{
	@Input( 'graphWidgetUrl' ) url: string;
	@Input( 'graphWidgetHideTable' ) hideTable: boolean;

	isLoading = true;
	graphData: any;

	async ngOnChanges()
	{
		this.isLoading = true;

		const response = await Api.sendRequest( this.url, null, { detach: true } );

		if ( response.data && angular.isArray( response.data ) ) {
			this.graphData = Graph.createGraphData( response.data );
		}

		this.isLoading = false;
	}
}
