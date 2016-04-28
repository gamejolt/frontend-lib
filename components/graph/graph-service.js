angular.module( 'gj.Graph' ).service( 'Graph', function()
{
	this.createGraphData = function( data )
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

					graphData.graph.push( {
						label: k,
						data: [],
					} );

					graphData.tableTotals[ k ] = row[ k ];
					graphData.colTotals[ k ] = 0;
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

				tableData[ k ] = row[ k ];

				graphData.graph[ i ].data.push( [
					row.time * 1000,
					parseInt( row[ k ], 10 ),
				] );

				graphData.colTotals[ k ] += parseInt( row[ k ], 10 );

				++i;
			}

			graphData.tableData.push( tableData );
		} );

		return graphData;
	};
} );
