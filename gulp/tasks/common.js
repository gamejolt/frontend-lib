var argv = require('minimist')(process.argv);
var gulp = require('gulp');
var shell = require('gulp-shell');
var FwdRef = require('undertaker-forward-reference');

// https://github.com/gulpjs/undertaker-forward-reference
// https://github.com/gulpjs/gulp/issues/802
gulp.registry(FwdRef());

module.exports = function(config, projectBase) {
	config.production = argv.production || false;
	config.watching = argv._.indexOf('watch') !== -1 ? 'initial' : false;
	config.noSourcemaps = config.noSourcemaps || false;
	config.write = argv.write || false;
	config.analyze = argv.analyze || false;
	config.server = argv.server || false;
	config.client = argv.client || false;
	config.noClean = argv.noClean || false;

	// Whether or not the environment of angular should be production or development.
	// Even when not doing prod builds we use the prod environment by default.
	// This way it's easy for anyone to build without the GJ dev environment.
	// You can pass this flag in to include the dev environment config for angular instead.
	config.developmentEnv = argv.development || false;

	config.port = config.port || 8080;
	config.framework = config.framework || 'angular';

	config.sections = config.sections || [];
	config.translationSections = config.translationSections || [];

	config.sections.push('app');
	config.buildSection = argv['section'] || 'app';

	if (config.server) {
		config.sections = config.serverSections;
	}

	if (argv['section']) {
		config.sections = [argv['section']];
	}

	config.projectBase = projectBase;
	config.buildBaseDir = process.env.BUILD_DIR || './';
	config.buildDir = config.buildBaseDir + (config.production ? 'build/prod' : 'build/dev');
	config.libDir = 'src/lib/';
	config.gjLibDir = 'src/lib/gj-lib-client/';
	config.bowerDir = 'src/bower-lib/';

	if (config.server) {
		config.write = true;
		config.buildDir += '-server';
	} else if (config.client) {
		config.write = true;
		config.buildDir += '-client';
		config.clientBuildDir = config.buildDir + '-build';
		config.clientBuildCacheDir = config.buildDir + '-cache';
	}

	require('./clean.js')(config);
	require('./translations.js')(config);
	require('./client.js')(config);
	require('./webpack.js')(config);

	gulp.task(
		'update-lib',
		shell.task([
			'cd ' + config.gjLibDir + ' && git pull',
			'git add ' + config.gjLibDir,
			'git commit -m "Update GJ lib."',
		])
	);

	gulp.task(
		'commit-build',
		shell.task(['git add --all build/prod', 'git commit -m "New build."', 'git push'])
	);
};
