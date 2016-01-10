angular.module( 'gj.Graph.Table' ).directive( 'gjGraphTable', function()
{
	return {
		restrict: 'E',
		templateUrl: '/lib/gj-lib-client/components/graph/table/table.html',
		scope: {},
		bindToController: {
			tableData: '=graphTableData',
			tableTotals: '=graphTableTotals',
		},
		controllerAs: 'ctrl',
		controller: function()
		{
			this.labels = [];
			for ( var k in this.tableTotals ) {
				this.labels.push( k );
			}
		},
	};
} );
