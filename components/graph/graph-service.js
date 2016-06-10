angular.module( 'gj.Graph' ).service( 'Graph', function()
{
	this.createGraphData = function( data, label )
	{
		var graphData = {};
		graphData.graph = [];
		graphData.tableData = [];
		graphData.tableTotals = {};
		graphData.colTotals = {};

		data.forEach( function( row )
		{
			if ( !row.time ) {
				for ( var k in row ) {
					if ( k == 'time' ) {
						continue;
					}
					if ( label && k == label ) {
						continue;
					}

					var _label = label ? label : k;

					graphData.graph.push( {
						label: _label,
						data: [],
					} );

					graphData.tableTotals[ _label ] = row[ k ];
					graphData.colTotals[ _label ] = 0;
				}

				return;
			}

			var tableData = {
				time: row.time * 1000,
			};

			var i = 0;
			for ( var k in row ) {
				if ( k == 'time' ) {
					continue;
				}
				if ( label && k == label ) {
					continue;
				}

				var _label = label ? label : k;
				tableData[ _label ] = row[ k ];

				graphData.graph[ i ].data.push( [
					row.time * 1000,
					parseInt( row[ k ], 10 ),
				] );

				graphData.colTotals[ _label ] += parseInt( row[ k ], 10 );

				++i;
			}

			graphData.tableData.push( tableData );
		} );

		return graphData;
	};
} );
