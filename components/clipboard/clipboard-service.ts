import { Injectable, Inject } from 'ng-metadata/core';

@Injectable()
export class Clipboard
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
		const clipboardElem: any = angular.element( `<input type="text" value="${url}" id="clipboard-${rand}">` );
		angular.element( this.$document[0].body ).append( clipboardElem );
		clipboardElem[0].select();

		if ( this.$document[0].execCommand( 'copy' ) ) {
			this.growls.success( 'Copied to your clipboard.', 'Copied!' );
		}
		else {
			this.growls.error( 'Could not copy to your clipboard. Dunno why. Sorry.', 'Copy Failed' );
		}

		clipboardElem.remove();
	}
}
