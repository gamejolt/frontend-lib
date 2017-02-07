angular.module( 'gj.Tooltip', [ 'ui.bootstrap.tooltip', 'ui.bootstrap.tooltip.tpls' ] ).config( function( $tooltipProvider )
{
	$tooltipProvider.options( {
		appendToBody: true,
	} );
} );

require( './tooltip-directive' );
