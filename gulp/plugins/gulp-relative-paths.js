var through = require( 'through2' );
var gutil = require( 'gulp-util' );
var PluginError = gutil.PluginError;
var globExpand = require( 'glob-expand' );
var fs = require( 'fs' );
var path = require( 'path' );
var _ = require( 'lodash' );
var Concat = require( 'concat-with-sourcemaps' );
var path = require( 'path' );

const PLUGIN_NAME = 'gulp-inject-modules.js';

function relativePaths( config )
{
	const cwd = process.cwd();

	var nonFileNameCharRegex = /[^a-zA-Z0-9\.\-\_\/]/g;
	var nonFileNameChar = '[^a-zA-Z0-9\\.\\-\\_\\/]';
	var qoutes = '\'|"';

	function referenceToRegexs( reference )
	{
		var escapedRefPathBase = '\/(app|auth|checkout|client|doc-game-api|files|lib|terms|translations)\/(.*?)';
		var escapedRefPathExt = '[a-zA-Z]{2,4}';

		var regExp, regExps = [];
		// var isJSReference = reference.path.match(/\.js$/);

		// // Extensionless javascript file references has to to be qouted
		// if (isJSReference) {
		// 	regExp = '(' + qoutes + ')(' + escapedRefPathBase + ')()(' + qoutes + '|$)';
		// 	regExps.push(new RegExp(regExp, 'g'));
		// }

		// Expect left and right sides of the reference to be a non-filename type character, escape special regex chars
		regExp = '(' + nonFileNameChar + ')(' + escapedRefPathBase + ')(' + escapedRefPathExt + ')(' + nonFileNameChar + '|$)';
		return new RegExp(regExp, 'g');
	}

	// console.log(referenceToRegexs());

	var regex = referenceToRegexs();
	console.log( regex );

	// Creating a stream through wh[ich each file will pass
	const stream = through.obj( function( file, enc, callback )
	{
		if ( file.isBuffer() ) {

			let fileContents = file.contents.toString();
			let matches = fileContents.match( regex );

			if ( matches ) {
				console.log( file.path );

				let wasModified = false;
				for ( match of matches ) {
					match = match.replace( nonFileNameCharRegex, '' );
					let replacement = path.join( file.base, match );

					if ( !fs.existsSync( replacement ) ) {
						continue;
					}

					replacement = path.relative( path.dirname( file.path ), replacement );
					replacement = replacement.replace( /\\/g, '/' );

					console.log( 'replace', match, replacement );
					fileContents = fileContents.replace( match, replacement );
					wasModified = true;
				}

				if ( wasModified ) {
					file.contents = new Buffer( fileContents );
				}
			}
		}
		// Streams not supported.
		else if ( file.isStream() ) {
			this.emit( 'error', new gutil.PluginError( PLUGIN_NAME, 'Streaming not supported.' ) );
			return callback();
		}

		this.push( file );
		return callback();
	} );

	// returning the file stream
	return stream;
};

module.exports = relativePaths;
