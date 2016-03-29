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

			color: color,
			highlight: '#fff',
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

		segmentStrokeColor: '#191919',
	};

	return {
		restrict: 'E',
		templateUrl: '/lib/gj-lib-client/components/graph/graph.html',
		scope: {
			graphData: '=dataset',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $attrs )
		{
			var _this = this;

			this.type = $attrs.type || 'line';
			this.legendBinding = null;
			this.shouldShowLegend = true;
			this.chartOptions = angular.copy( chartOptions );
			this.ourColors = angular.copy( globalColors );
			this.isBackgroundVariant = false;

			// if ( angular.isDefined( $attrs.noAnimation ) ) {
			// 	this.chartOptions.animation = false;
			// }

			if ( angular.isDefined( $attrs.backgroundVariant ) ) {
				this.isBackgroundVariant = true;
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
			}

			$scope.$watch( 'ctrl.graphData', function()
			{
				if ( _this.type == 'line' ) {

					_this.data = {
						labels: [],
						datasets: [],
					};

					_this.graphData.forEach( function( series, i )
					{
						var dataset = {
							label: series.label,
							data: [],
						};

						angular.extend( dataset, this.ourColors[i] );

						series.data.forEach( function( row )
						{
							if ( i == 0 ) {
								this.data.labels.push( moment( row[0] ).format( 'MMM DD' ) );
							}

							dataset.data.push( row[1] );
							// dataset.data.push( Math.ceil( Math.random() * 100 ) );
						}, this );

						this.data.datasets.push( dataset );
					}, _this );
				}
				else if ( _this.type == 'pie' || _this.type == 'doughnut' ) {

					_this.data = _this.graphData.map( function( item, i )
					{
						return angular.extend( item, _this.ourColors[ i + 1 ] );
					} );
				}
			} );
		}
	};
} );
