var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var plugins = require( 'gulp-load-plugins' )();

module.exports = function( config )
{
	function noop( cb )
	{
		cb();
	}

	// This will probably break eventually.
	// unwrap exists in gulp, but not in the forward ref thing
	// That's why this works, but it could easily not work in future.
	function checkHooks( cb )
	{
		if ( !gulp.task( 'html:pre' ).unwrap ) {
			gulp.task( 'html:pre', noop );
		}

		if ( !gulp.task( 'html:post' ).unwrap ) {
			gulp.task( 'html:post', noop );
		}

		cb();
	}

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

	gulp.task( 'html', gulp.series( checkHooks, 'html:pre', 'html:main', 'html:post' ) );
};
