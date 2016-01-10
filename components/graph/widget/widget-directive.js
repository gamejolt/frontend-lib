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
		controller: function( Api )
		{
			var _this = this;
			this.isLoading = true;

			Api.sendRequest( this.url, null, { detach: true } ).then( function( response )
			{
				if ( response.data && angular.isArray( response.data ) ) {
					_this.graphData = Graph.createGraphData( response.data );
				}

				_this.isLoading = false;
			} );
		},
	};
} );
