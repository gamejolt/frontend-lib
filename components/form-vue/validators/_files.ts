export function validateFiles( files: File | File[], cb: ( file: File ) => boolean )
{
	files = Array.isArray( files ) ? files : [ files ];

	for ( const file of files ) {
		if ( !cb( file ) ) {
			return false;
		}
	}

	return true;
}

export async function validateFilesAsync( files: File | File[], cb: ( file: File ) => Promise<boolean> )
{
	files = Array.isArray( files ) ? files : [ files ];

	for ( const file of files ) {
		if ( !await cb( file ) ) {
			return { valid: false };
		}
	}

	return { valid: true };
}
