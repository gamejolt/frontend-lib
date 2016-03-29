angular.module( 'gj.Graph.Widget' ).directive( 'gjGraphWidget', function( Graph )
{
	return {
		restrict: 'E',
		templateUrl: '/lib/gj-lib-client/components/graph/widget/widget.html',
		scope: {},
		bindToController: {
			url: '@graphWidgetUrl',
			hideTable: '=graphWidgetHideTable',
		},
		controllerAs: 'ctrl',
		controller: function( $attrs, Api )
		{
			var _this = this;
			this.isLoading = true;

			$attrs.$observe( 'graphWidgetUrl', function( url )
			{
				// _this.isLoading = true;
				Api.sendRequest( url, null, { detach: true } ).then( function( response )
				{
					if ( response.data && angular.isArray( response.data ) ) {
						_this.graphData = Graph.createGraphData( response.data );
					}

					_this.isLoading = false;
				} );
			} );
		},
	};
} );

/*
angular.module( 'gj.Graph.Widget' ).directive( 'gjGraphWidget', function( Graph )
{
	return {
		restrict: 'E',
		templateUrl: '/lib/gj-lib-client/components/graph/widget/widget.html',
		scope: {},
		bindToController: {
			url: '@graphWidgetUrl',
			hideTable: '=graphWidgetHideTable',
			_graphData: '=graphWidgetData',
		},
		controllerAs: 'ctrl',
		controller: function( Api )
		{
			var _this = this;
			this.isLoading = true;

			if ( angular.isDefined( this._graphData ) ) {
				this.isLoading = false;
			}
			else {
				Api.sendRequest( this.url, null, { detach: true } ).then( function( response )
				{
					if ( response.data && angular.isArray( response.data ) ) {
						_this.graphData = Graph.createGraphData( response.data );
					}

					_this.isLoading = false;
				} );
			}

			$scope.$watch( function()
			{
				return _this._graphData;
			},
			function( graphData )
			{
				_this.graphData = graphData;
			} );
		},
	};
} );

*/
