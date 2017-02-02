import { Component, Input, OnInit, OnChanges } from 'ng-metadata/core';
import * as moment from 'moment';
import * as template from '!html-loader!./graph.component.html';

import { Loader } from '../loader/loader.service';

const globalColors = [
	'#ffffff',
	'#ccff00',
	'#31d6ff',
	'#ff3fac',
	'#2f7f6f',
]
.map( ( color ) =>
{
	return {
		fillColor: 'rgba( 255, 255, 255, 0.05 )',
		strokeColor: color,
		pointColor: color,
		pointStrokeColor: '#191919',
		pointHighlightFill: '#fff',
		pointHighlightStroke: '#fff',

		color: color,
		highlight: '#fff',
	};
} );

const chartOptions = {
	// bezierCurve: false,
	animationEasing: 'easeOutExpo',
	animationSteps: 30,  // Faster.

	responsive: true,
	maintainAspectRatio: false,

	scaleShowVerticalLines: false,
	scaleShowHorizontalLines: false,
	scaleBeginAtZero: true,
	scaleGridLineColor: 'rgba( 255, 255, 255, 0.05 )',

	// Try to match site styling.
	scaleFontColor: '#7e7e7e ',
	scaleFontFamily: "Lato, 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
	scaleFontSize: 11,

	tooltipCornerRadius: 0,

	tooltipFontColor: '#c1c1c1 ',
	tooltipFontFamily: "Lato, 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
	tooltipFontSize: 11,

	tooltipTitleFontColor: '#fff',
	tooltipTitleFontFamily: "Lato, 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
	tooltipTitleFontSize: 14,

	pointDotRadius: 4,
	pointDotStrokeWidth: 2,

	datasetStrokeWidth: 1,

	segmentStrokeColor: '#191919',
};

@Component({
	selector: 'gj-graph',
	template,
})
export class GraphComponent implements OnInit, OnChanges
{
	@Input( 'dataset' ) graphData: any;
	@Input() type = 'line';
	@Input() backgroundVariant: boolean;

	data: any = {};
	legendBinding = null;
	shouldShowLegend = true;
	chartOptions: any = Object.assign( {}, chartOptions );
	ourColors: any = Object.assign( {}, globalColors );

	Loader = Loader;

	constructor()
	{
		Loader.load( 'chart' );
	}

	ngOnInit()
	{
		if ( this.backgroundVariant ) {
			this.shouldShowLegend = false;
			this.chartOptions.showScale = false;
			this.chartOptions.showTooltips = false;
			this.chartOptions.pointDotRadius = 2;
			this.chartOptions.pointDotStrokeWidth = 1;

			this.ourColors[0] = {
				fillColor: 'rgba( 0, 0, 0, 0.05 )',
				strokeColor: '#eee',
				pointColor: '#eee',
				pointStrokeColor: '#fff',
				pointHighlightFill: '#eee',
				pointHighlightStroke: '#eee',
			};

			this.checkData();
		}
	}

	ngOnChanges()
	{
		this.checkData();
	}

	private checkData()
	{
		if ( !this.graphData ) {
			return;
		}

		if ( this.type == 'line' ) {

			this.data = {
				labels: [],
				datasets: [],
			};

			this.graphData.forEach( ( series: any, i: number ) =>
			{
				let dataset: any = {
					label: series.label,
					data: [],
				};

				Object.assign( dataset, this.ourColors[i] );

				for ( const row of series.data ) {
					if ( i === 0 ) {
						this.data.labels.push( moment( row[0] ).format( 'MMM DD' ) );
					}

					dataset.data.push( row[1] );
				}

				this.data.datasets.push( dataset );
			} );
		}
		else if ( this.type === 'pie' || this.type === 'doughnut' ) {
			this.data = this.graphData.map( ( item: any, i: number ) =>
			{
				return Object.assign( item, this.ourColors[ i + 1 ] );
			} );
		}
	}
}
