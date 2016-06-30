var argv = require( 'minimist' )( process.argv );
var gulp = require( 'gulp' );
var sequence = require( 'run-sequence' );
var shell = require( 'gulp-shell' );

module.exports = function( config )
{
	config.production = argv.production || false;
	config.watching = false;
	config.noSourcemaps = config.noSourcemaps || false;

	// Whether or not the environment of angular should be production or development.
	// Even when not doing prod builds we use the prod environment by default.
	// This way it's easy for anyone to build without the GJ dev environment.
	// You can pass this flag in to include the dev environment config for angular instead.
	config.developmentEnv = argv.development || false;

	config.sections = config.sections || [];
	config.translationSections = config.translationSections || [];

	config.sections.push( 'app' );

	config.buildSection = argv['section'] || null;
	config.buildModule = argv['module'] || null;

	config.buildBaseDir = process.env.BUILD_DIR || './';
	config.buildDir = config.buildBaseDir + (config.production ? 'build/prod' : 'build/dev');
	config.libDir = 'src/lib/';
	config.gjLibDir = 'src/lib/gj-lib-client/';
	config.bowerDir = 'src/bower-lib/';

	require( './styles.js' )( config );
	require( './js.js' )( config );
	require( './html.js' )( config );
	require( './fonts.js' )( config );
	require( './markdown.js' )( config );
	require( './images.js' )( config );
	require( './translations.js' )( config );
	require( './inject.js' )( config );
	require( './clean.js' )( config );
	require( './watch.js' )( config );

	gulp.task( 'extra', function()
	{
		return gulp.src( [
			'!src/bower-lib/**/*',
			'src/**/*.xml',
			'src/**/*.mp4',
			'src/**/*.wav',
			'src/**/*.ogg',
			'src/**/*.pdf',
			'src/**/*.txt',
			'src/channel.html',
		] ).pipe( gulp.dest( config.buildDir ) );
	} );

	gulp.task( 'pre', function(){} );
	gulp.task( 'post', function(){} );

	gulp.task( 'default', function( callback )
	{
		return sequence( 'clean:pre', 'pre', [ 'styles', 'js', 'images', 'html', 'fonts', 'markdown', 'extra' ], 'translations:compile', 'inject', 'post', 'clean:post', callback );
	} );

	gulp.task( 'update-lib', shell.task( [
		'cd ' + config.gjLibDir + ' && git pull',
		'git add ' + config.gjLibDir,
		'git commit -m "Update GJ lib."'
	] ) );

	gulp.task( 'commit-build', shell.task( [
		'git add --all build/prod',
		'git commit -m "New build."',
		'git push'
	] ) );
};
