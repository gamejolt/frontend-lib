var gulp = require( 'gulp' );
var historyApiFallback = require( 'connect-history-api-fallback' );
var plugins = require( 'gulp-load-plugins' )();

module.exports = function( config )
{
	gulp.task( 'serve', function( cb )
	{
		cb();
		plugins.connect.server( {
			root: config.buildDir,
			livereload: true,
			middleware: function( connect, opt )
			{
				return [ historyApiFallback ];
			}
		} );
	} );

	// We want to do a full default build, and then start the server.
	// This way we're not live reloading a ton before the initial build is done.
	function startWatch( cb )
	{
		config.watching = 'initial';
		cb();
	}

	gulp.task( 'watch:start', gulp.series( startWatch, 'default', 'serve' ) );

	// We depend on 'default' so that it does the full build before starting.
	gulp.task( 'watch', gulp.series( 'watch:start', function()
	{
		config.watching = 'watching';

		// Stylus.
		gulp.watch(
			[
				'src/**/*.styl',
			],
			gulp.parallel( 'styles' )
		);

		// JavaScript AND html.
		var jsPaths = [
			'src/**/*.{js,ts}',

			// Templates compile into JS for components.
			'src/**/*.html',
		];

		gulp.task( 'reload:js', function()
		{
			return gulp.src( jsPaths, { read: false } ).pipe( plugins.connect.reload() );
		} );

		gulp.task( 'html-js:reload', gulp.series( 'html', 'js', 'reload:js' ) );

		gulp.watch(
			jsPaths,
			gulp.parallel( 'html-js:reload' )
		);

		// Images.
		gulp.watch(
			[
				'src/**/*.{png,jpg,jpeg,gif,svg,ico}'
			],
			gulp.parallel( 'images' )
		);

		// Markdown.
		gulp.watch(
			[
				'src/**/*.md',
			],
			gulp.parallel( 'markdown' )
		);
	} ) );
};
