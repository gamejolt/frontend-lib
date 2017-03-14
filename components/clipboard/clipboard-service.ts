import { Growls } from '../growls/growls.service';

export class Clipboard
{
	static copy( url: string )
	{
		// We have to add it into view, select, copy, then remove. Yeesh.
		const rand = Math.random();
		const clipboardElem = document.createElement( 'input' );
		clipboardElem.type = 'text';
		clipboardElem.value = url;
		clipboardElem.id = `clipboard-${rand}`;
		document.body.appendChild( clipboardElem );
		clipboardElem.select();

		const result = window.document.execCommand( 'copy' );

		if ( GJ_IS_ANGULAR ) {
			if ( result ) {
				Growls.success( 'Copied to your clipboard.', 'Copied!' );
			}
			else {
				Growls.error( 'Could not copy to your clipboard. Dunno why. Sorry.', 'Copy Failed' );
			}
		}

		clipboardElem.parentNode!.removeChild( clipboardElem );
	}
}
