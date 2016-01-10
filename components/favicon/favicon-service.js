angular.module( 'gj.Favicon' ).service( 'Favicon', function( $window )
{
	var favicon = new $window.Favico( {
	    animation: 'none',
	    type: 'rectangle',
	    bgColor: '#ff3fac',
	    textColor: '#fff',
	} );

	this.badge = function( num )
	{
		favicon.badge( num );
	};

	this.reset = function()
	{
		favicon.reset();
	};
} );
