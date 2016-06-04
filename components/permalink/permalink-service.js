angular.module( 'gj.Permalink' ).service( 'Permalink', function( $document, Growls )
{
	this.copy = function( url )
	{
		// We have to add it into view, select, copy, then remove. Yeesh.
		var rand = Math.random();
		var permalinkElem = angular.element( '<input type="text" value="' + url + '" id="permalink-' + rand + '">' );
		angular.element( $document[0].body ).append( permalinkElem );
		permalinkElem[0].select();

		if ( document.execCommand( 'copy' ) ) {
			Growls.success( 'Copied to your clipboard.', 'Copied!' );
		}
		else {
			Growls.error( 'Could not copy to your clipboard. Dunno why. Sorry.', 'Copy Failed' );
		}

		permalinkElem.remove();
	};
} );
