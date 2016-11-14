var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var plugins = require( 'gulp-load-plugins' )();

module.exports = function( config )
{
	gulp.task( 'html:pre', function( cb ){ cb(); } );
	gulp.task( 'html:post', function( cb ){ cb(); } );

	gulp.task( 'html:main', function()
	{
		var src = config.sections.map( function( section )
		{
			return 'src/' + section + '/**/*.html';
		} );

		src.push( config.gjLibDir + '**/*.html' );
		src.push( 'src/*.html' );

		// Only copy what has changed since last time.
		var stream = gulp.src( src, { base: 'src' } );

		// Add in any injections here that may be configured.
		if ( config.injections ) {
			for ( var key in config.injections ) {
				stream = stream.pipe( plugins.replace( key, config.injections[ key ] ) );
			}
		}

		stream = stream.pipe( gulp.dest( config.buildDir ) );

		return stream;
	} );

	gulp.task( 'html', gulp.series( 'html:pre', 'html:main', 'html:post' ) );
};
