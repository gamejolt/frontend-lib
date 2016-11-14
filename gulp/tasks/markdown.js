var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var plugins = require( 'gulp-load-plugins' )();

module.exports = function( config )
{
	gulp.task( 'markdown', function( cb )
	{
		if ( !config.markdown ) {
			cb();
			return;
		}

		// Only copy what has changed since last time.
		return gulp.src( config.markdown, { base: 'src' } )
			.pipe( plugins.newer( config.buildDir ) )
			.pipe( gulp.dest( config.buildDir ) )
			.pipe( plugins.connect.reload() );
	} );
};
