var through = require( 'through2' );
var gutil = require( 'gulp-util' );
var PluginError = gutil.PluginError;
var sanitize = require( 'sanitize-html' );

const PLUGIN_NAME = 'gulp-sanitize-translations.js';

module.exports = function( options )
{
	// Creating a stream through which each file will pass
	var stream = through.obj( function( file, enc, callback )
	{
		if ( file.isBuffer() ) {

			var content = file.contents.toString();
			var parsed = JSON.parse( content );
			var lang = Object.keys( parsed )[0];

			for ( var i in parsed[ lang ] ) {
				parsed[ lang ][ i ] = sanitize( parsed[ lang ][ i ] );
			}

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
