var through = require( 'through2' );
var gutil = require( 'gulp-util' );
var PluginError = gutil.PluginError;
var path = require( 'path' );

const PLUGIN_NAME = 'gulp-split-translations.js';

module.exports = function( sections )
{
	// Creating a stream through which each file will pass
	var stream = through.obj( function( file, enc, callback )
	{
		if ( file.isBuffer() ) {

			// If we aren't splitting out sections, just pass through.
			if ( !sections.length ) {
				this.push( file );
				return callback();
			}

			var content = file.contents.toString();
			var parsed = JSON.parse( content );
			var lang = Object.keys( parsed )[0];

			sections.forEach( function( section )
			{
				var sectionRegex = new RegExp( '^' + section + '\.' );
				var sectionJson = {};
				sectionJson[ lang ] = {};

				for ( var i in parsed[ lang ] ) {
					if ( i.match( sectionRegex ) ) {
						sectionJson[ lang ][ i ] = parsed[ lang ][ i ];
						delete parsed[ lang ][ i ];
					}
				}

				this.push( new gutil.File( {
					cwd: file.cwd,
					base: file.base,
					path: path.join( path.dirname( file.path ), section + '.json' ),
					contents: new Buffer( JSON.stringify( sectionJson ), 'utf-8' ),
				} ) );
			}, this );

			file.contents = new Buffer( JSON.stringify( parsed ), 'utf-8' );
		}
		// Streams not supported.
		else if ( file.isStream() ) {
			this.emit( 'error', new gutil.PluginError( PLUGIN_NAME, 'Streaming not supported.' ) );
			return callback();
		}

		// Anything else just falls through.
		this.push( file );
		return callback();
	} );

	// returning the file stream
	return stream;
};
