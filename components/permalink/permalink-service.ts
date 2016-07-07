import { Injectable, Inject } from 'ng-metadata/core';

@Injectable()
export class Permalink
{
	constructor(
		@Inject( '$document' ) private $document: ng.IDocumentService,
		@Inject( 'Growls' ) private growls: any
	)
	{
	}

	copy( url: string )
	{
		// We have to add it into view, select, copy, then remove. Yeesh.
		const rand = Math.random();
		const permalinkElem = angular.element( `<input type="text" value="${url}" id="permalink-${rand}">` );
		angular.element( this.$document[0].body ).append( permalinkElem );
		permalinkElem[0].select();

		if ( this.$document[0].execCommand( 'copy' ) ) {
			this.growls.success( 'Copied to your clipboard.', 'Copied!' );
		}
		else {
			this.growls.error( 'Could not copy to your clipboard. Dunno why. Sorry.', 'Copy Failed' );
		}

		permalinkElem.remove();
	}
}
