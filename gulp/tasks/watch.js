var gulp = require( 'gulp' );
var sequence = require( 'run-sequence' );
var historyApiFallback = require( 'connect-history-api-fallback' );
var plugins = require( 'gulp-load-plugins' )();

module.exports = function( config )
{
	gulp.task( 'serve', function()
	{
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
	gulp.task( 'watch:start', function( cb )
	{
		// Set that we're watching.
		config.watching = true;

		return sequence( 'default', 'serve', cb );
	} );

	// We depend on 'default' so that it does the full build before starting.
	gulp.task( 'watch', [ 'watch:start' ], function()
	{
		// Stylus.
		gulp.watch(
			[
				'src/**/*.styl',
			],
			[ 'styles' ]
		);

		// JavaScript.
		var jsPaths = [
			'src/**/*.js',
			config.gjLibDir + 'components/**/*.html',  // For any compiled templates, like angular-ui-bootstrap.
		];

		gulp.watch(
			jsPaths,
			[ 'js' ]
		);

		// HTML.
		gulp.watch(
			[
				'src/**/*.html',
			],
			// Gotta do JS too since components/views might need to compile HTML into template cache.
			[ 'html', 'js' ]
		);

		// Images.
		gulp.watch(
			[
				'src/**/*.{png,jpg,jpeg,gif,svg,ico}'
			],
			[ 'images' ]
		);

		// Markdown.
		gulp.watch(
			[
				'src/**/*.md',
			],
			[ 'markdown' ]
		);
	} );
};
