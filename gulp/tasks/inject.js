var _ = require( 'lodash' );
var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var plugins = require( 'gulp-load-plugins' )();
var path = require( 'path' );

module.exports = function( config )
{
	function escapeForRegExp( str )
	{
		return str.replace( /[-\/\\^$*+?.()|[\]{}]/g, '\\$&' );
	}

	gulp.task( 'inject', function()
	{
		if ( config.production && !config.noInject ) {

			var options = {
				debug: true,
				dontRenameFile: [
					// Examples: /index.html, /chat.html
					// Not: /app/views/something.html
					/^\/[^\/]*\.html$/ig,

					// Other common things that have to be static filenames.
					/^\/robots\.txt$/,
					/^\/crossdomain\.xml$/,
				],
				transformPath: function( rev, source, path )
				{
					return config.staticCdn + rev;
				},

				// The below is because one of the stupidest things ever...
				// It looks for files without extensions and replaces.
				// This means 'app' will be replaced for an 'app.js' file...
				// More info: https://github.com/smysnk/gulp-rev-all/issues/106
				annotator: function( contents, path )
				{
					var fragments = [ { 'contents': contents } ];
					return fragments;
				},
				replacer: function( fragment, replaceRegExp, newReference, referencedFile )
				{
					// If the original had .js, force the reference to have .js too...
					if ( referencedFile.revFilenameExtOriginal === '.js' && !newReference.match( /\.js$/ ) ) {
						return;
					}
					fragment.contents = fragment.contents.replace( replaceRegExp, '$1' + newReference + '$3$4' );
				},
			};

			var revAll = new plugins.revAll( options );

			return gulp.src( [ config.buildDir + '/**' ] )
				.pipe( revAll.revision() )
				.pipe( gulp.dest( config.buildDir ) );
		}
	} );
};
