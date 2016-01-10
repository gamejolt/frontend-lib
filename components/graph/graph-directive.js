/**
 * TODO: Better type of input data that maps closer to what we need for angular-chart.js
 */
angular.module( 'gj.Graph' ).directive( 'gjGraph', function( $window, Screen )
{
	var globalColors = [
		'#ffffff',
		'#ccff00',
		'#31d6ff',
		'#ff3fac',
	].map( function( color )
	{
		return {
			fillColor: 'rgba( 255, 255, 255, 0.05 )',
			strokeColor: color,
			pointColor: color,
			pointStrokeColor: '#191919',
			pointHighlightFill: '#fff',
			pointHighlightStroke: '#fff',
		};
	} );

	var chartOptions = {
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
	};

	return {
		restrict: 'E',
		template: '<div class="graph full-bleed-xs"><div class="chart-line"><canvas tc-chartjs-line chart-data="data" chart-options="chartOptions" chart-legend="legendBinding"></canvas></div><div tc-chartjs-legend chart-legend="legendBinding"></div></div>',
		scope: {
			graphData: '=dataset',
		},
		link: function( scope, element, attrs )
		{
			scope.chartOptions = chartOptions;
			scope.legendBinding = null;

			scope.data = {
				labels: [],
				datasets: [],
			};

			scope.graphData.forEach( function( series, i )
			{
				var dataset = {
					label: series.label,
					data: [],
				};

				angular.extend( dataset, globalColors[i] );

				series.data.forEach( function( row )
				{
					if ( i == 0 ) {
						scope.data.labels.push( moment( row[0] ).format( 'MMM DD' ) );
					}

					dataset.data.push( row[1] );
					// dataset.data.push( Math.ceil( Math.random() * 100 ) );
				} );

				scope.data.datasets.push( dataset );
			} );
		}
	};
} );
