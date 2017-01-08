var _ = require( 'lodash' );
var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var plugins = require( 'gulp-load-plugins' )();
var path = require( 'path' );

module.exports = function( config )
{
	gulp.task( 'inject', function( cb )
	{
		if ( !config.production || config.noInject ) {
			cb();
			return;
		}

		var injectVersion = config.injectVersion || 1;

		var options = {
			dontRenameFile: [
				// Examples: /index.html, /chat.html, index.html
				// Not: /app/views/something.html
				/^\/?[^\/]*\.html$/ig,

				// Other common things that have to be static filenames.
				/^\/robots\.txt$/,
				/^\/crossdomain\.xml$/,
			],
			dontSearchFile: [
				/.*\.pdf$/i,  // Don't want to rename any PDFs.
			],
			transformPath: function( rev, source, path )
			{
				return config.staticCdn + rev;
			},
			transformFilename: function( file, hash )
			{
				var ext = path.extname( file.path );
				return path.basename( file.path, ext ) + '.' + hash + '-' + injectVersion + ext;
			},
		};

		var revAll = new plugins.revAll( options );

		return gulp.src( [ config.buildDir + '/**' ] )
			.pipe( revAll.revision() )
			.pipe( gulp.dest( config.buildDir ) );
	} );
};
