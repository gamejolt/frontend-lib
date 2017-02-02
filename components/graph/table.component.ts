import { Component, Input, OnInit } from 'ng-metadata/core';
import * as template from '!html-loader!./table.component.html';

@Component({
	selector: 'gj-graph-table',
	template,
})
export class GraphTableComponent implements OnInit
{
	@Input( 'graphTableData' ) tableData: any;
	@Input( 'graphTableTotals' ) tableTotals: any;

	labels: string[];

	ngOnInit()
	{
		this.labels = [];
		for ( const k in this.tableTotals ) {
			this.labels.push( k );
		}
	}
}
