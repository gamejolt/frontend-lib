import { Injectable, Inject } from '@angular/core';

@Injectable()
export class ImgHelper
{
	constructor(
		@Inject( '$document' ) private $document: ng.IDocumentService,
		@Inject( '$q' ) private $q: ng.IQService
	)
	{
	}

	loaded( url: string )
	{
		return new this.$q( ( resolve, reject ) =>
		{
			const img: HTMLImageElement = this.$document[0].createElement( 'img' );
			img.onload = resolve;
			img.onerror = reject;
			img.src = url;
		} );
	}

	getResizedDimensions( originalWidth: number, originalHeight: number, maxWidth?: number, maxHeight?: number )
	{
		const aspectRatio = originalHeight / originalWidth;
		let width: number, height: number;

		// Setting max for both.
		if ( maxWidth && maxHeight ) {
			width = Math.min( originalWidth, maxWidth );
			height = width * aspectRatio;

			if ( height > maxHeight ) {
				height = maxHeight;
				width = height / aspectRatio;
			}
		}
		else if ( maxWidth && !maxHeight ) {
			width = Math.min( originalWidth, maxWidth );
			height = width * aspectRatio;
		}
		else if ( !maxWidth && maxHeight ) {
			height = Math.min( originalHeight, maxHeight );
			width = height / aspectRatio;
		}
		else {
			throw new Error( 'Invalid params.' );
		}

		return {
			width,
			height,
		};
	}
}
