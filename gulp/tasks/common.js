const argv = require('minimist')(process.argv);
const os = require('os');
const gulp = require('gulp');
const shell = require('gulp-shell');
const FwdRef = require('undertaker-forward-reference');

// https://github.com/gulpjs/undertaker-forward-reference
// https://github.com/gulpjs/gulp/issues/802
gulp.registry(FwdRef());

module.exports = (config, projectBase) => {
	function filterSections(func) {
		const sections = {};
		for (const section in config.sections) {
			const sectionConfig = config.sections[section];
			if (func(sectionConfig, section)) {
				sections[section] = sectionConfig;
			}
		}
		return sections;
	}

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
	config.port = config.port || argv.port || 8080;

	config.translationSections = config.translationSections || [];
	config.buildSection = argv['section'] || 'app';

	if (config.server) {
		config.sections = filterSections(i => i.server);
	} else if (config.client) {
		config.sections = filterSections(i => i.client);
	}

	if (argv['section']) {
		const argSection = argv['section'];
		config.sections = {
			[argSection]: config.sections[argSection],
		};
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

		config.arch = argv.arch || '64';

		// Get our platform that we are building on.
		switch (os.type()) {
			case 'Linux':
				config.platform = 'linux';
				break;

			case 'Windows_NT':
				config.platform = 'win';
				break;

			case 'Darwin':
				config.platform = 'osx';
				break;

			default:
				throw new Error('Can not build client on your OS type.');
		}

		config.platformArch = config.platform + config.arch;
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
