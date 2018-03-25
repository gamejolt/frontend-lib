const argv = require('minimist')(process.argv);
const gulp = require('gulp');
const gutil = require('gulp-util');
const plugins = require('gulp-load-plugins')();
const fs = require('fs');
const os = require('os');
const _ = require('lodash');
const shell = require('gulp-shell');
const path = require('path');
const mv = require('mv');

module.exports = config => {
	// We can skip all this stuff if not doing a client build.
	if (!config.client) {
		return;
	}

	const packageJson = require(path.resolve(config.projectBase, 'package.json'));
	const clientVoodooDir = path.join(config.buildDir, 'node_modules', 'client-voodoo');

	let nodeModulesTask = [
		'cd ' + config.buildDir + ' && yarn --production --ignore-scripts',
		'cd ' + clientVoodooDir + ' && yarn run postinstall', // We have to run client-voodoo's post install to get the joltron binaries in.
	];

	if (!config.production) {
		// When creating a development build sometimes we need some dependencies to be built in as is.
		// this allows us to make builds without having to publish a billion versions every time we want to test something.
		const devDependenciesToAddAsIs = ['client-voodoo'];
		for (let depName of devDependenciesToAddAsIs) {
			const devDep = path.resolve(config.projectBase, 'node_modules', depName);
			const buildDep = path.resolve(config.buildDir, 'node_modules', depName);

			if (config.platform === 'win') {
				nodeModulesTask.push('xcopy /E /I ' + devDep + ' ' + buildDep);
			} else {
				nodeModulesTask.push(
					'rm -rf ' + buildDep,
					'mkdir -p ' + buildDep,
					'cp -r ' + devDep + ' ' + path.dirname(buildDep)
				);
			}
		}
	}

	gulp.task('client:node-modules', shell.task(nodeModulesTask));

	/**
	 * Does the actual building into an NW executable.
	 */
	gulp.task('client:nw', () => {
		const NwBuilder = require('nw-builder');

		// We want the name to be:
		// 'game-jolt-client' on linux - because kebabs rock
		// 'GameJoltClient' on win - so it shows up well in process list and stuff
		// 'Game Jolt Client' on mac - so it shows up well in Applications folder.
		let appName = 'game-jolt-client';
		if (config.platform === 'win') {
			appName = 'GameJoltClient';
		} else if (config.platform === 'osx') {
			appName = 'Game Jolt Client';
		}

		const nw = new NwBuilder({
			version: '0.12.3',
			files: config.buildDir + '/**/*',
			buildDir: config.clientBuildDir,
			cacheDir: config.clientBuildCacheDir,
			platforms: [config.platformArch],
			appName: appName,
			buildType: () => {
				return 'build';
			},
			appVersion: packageJson.version,
			macZip: false, // Use a app.nw folder instead of ZIP file
			macIcns: path.resolve(__dirname, 'client/icons/mac.icns'),
			winIco: path.resolve(__dirname, 'client/icons/winico.ico'),

			// Tells it not to merge the app zip into the executable. Easier updating this way.
			mergeApp: false,
		});

		nw.on('log', console.log);

		return nw.build();
	});

	/**
	 * When packaging up the client, we need to push all the app files into a "package" folder. We
	 * do this so we can update really easily. This unzips the package.nw folder that nw-builder
	 * creates and pushes it into a "package" folder.
	 */
	gulp.task('client:nw-unpackage', cb => {
		const base = path.join(config.clientBuildDir, 'build', config.platformArch);
		const packageFilename = config.platformArch + '-package.zip';

		if (config.platform !== 'osx') {
			const packagePath = path.join(config.clientBuildDir, packageFilename);

			fs.renameSync(path.join(base, 'package.nw'), packagePath);

			const DecompressZip = require('decompress-zip');
			const unzipper = new DecompressZip(packagePath);

			unzipper.on('error', cb);
			unzipper.on('extract', () => {
				// We pull some stuff out of the package folder into the main folder.
				mv(
					path.join(base, 'package', 'node_modules'),
					path.join(base, 'node_modules'),
					err => {
						if (err) {
							throw err;
						}
						mv(
							path.join(base, 'package', 'package.json'),
							path.join(base, 'package.json'),
							err => {
								if (err) {
									throw err;
								}
								cb();
							}
						);
					}
				);
			});
			unzipper.extract({ path: path.join(base, 'package') });
		} else {
			const stream = gulp
				.src(base + '/Game Jolt Client.app/Contents/Resources/app.nw/**/*')
				.pipe(plugins.zip(packageFilename))
				.pipe(gulp.dest(config.clientBuildDir));

			stream.on('end', cb);
			stream.on('error', cb);
		}
	});

	/**
	 * Packages up the client builds into archive files so they can be distributed easier.
	 */
	gulp.task('client:package', cb => {
		if (config.platform === 'osx') {
			const appdmg = require('appdmg');

			const dmg = appdmg({
				target: config.clientBuildDir + '/osx.dmg',
				basepath: config.projectBase,
				specification: {
					title: 'Game Jolt Client',
					icon: path.resolve(__dirname, 'client/icons/mac.icns'),
					background: path.resolve(__dirname, 'client/icons/dmg-background.png'),
					'icon-size': 80,
					contents: [
						{
							x: 195,
							y: 370,
							type: 'file',
							path: path.resolve(
								config.clientBuildDir,
								'build',
								config.platformArch,
								'Game Jolt Client.app'
							),
						},
						{ x: 429, y: 370, type: 'link', path: '/Applications' },
					],
				},
			});

			dmg.on('progress', info => {
				console.log(info);
			});
			dmg.on('finish', () => {
				console.log('Finished building DMG.');
				cb();
			});
			dmg.on('error', err => {
				console.error(err);
				cb(err);
			});
		} else if (config.platform === 'win') {
			const InnoSetup = require('./client/inno-setup');
			const certFile = config.production
				? path.resolve(__dirname, 'client/certs/cert.pfx')
				: path.resolve(__dirname, 'client/vendor/cert.pfx');
			const certPw = config.production ? process.env['GJ_CERT_PASS'] : 'GJ123456';
			const builder = new InnoSetup(
				path.resolve(config.clientBuildDir, 'build', config.platformArch),
				path.resolve(config.clientBuildDir),
				packageJson.version,
				certFile,
				certPw.trim()
			);
			return builder.build();
		} else {
			return gulp
				.src(config.clientBuildDir + '/build/' + config.platformArch + '/**/*')
				.pipe(plugins.tar(config.platformArch + '.tar'))
				.pipe(plugins.gzip())
				.pipe(gulp.dest(config.clientBuildDir));
		}
	});

	gulp.task('client:joltron', cb => {
		const buildDir = path.resolve(config.clientBuildDir, 'build', config.platformArch);
		const clientVoodooDir = path.resolve(buildDir, 'node_modules', 'client-voodoo');

		const joltronSrc = path.resolve(
			clientVoodooDir,
			'bin',
			config.platform === 'win' ? 'GameJoltRunner.exe' : 'GameJoltRunner'
		);
		const joltronDest = path.resolve(
			clientVoodooDir,
			'..',
			'..',
			'..',
			config.platform === 'win' ? 'joltron.exe' : 'joltron'
		);

		const gjHost = config.developmentEnv
			? 'http://development.gamejolt.com'
			: 'https://gamejolt.com';

		let executable = '';
		if (config.platform === 'win') {
			executable = 'GameJoltClient.exe';
		} else if (config.platform === 'osx') {
			executable = 'Content/MacOS/nwjs';
		} else {
			executable = 'game-jolt-client';
		}

		fs
			.createReadStream(joltronSrc)
			.pipe(fs.createWriteStream(joltronDest))
			.on('error', cb)
			.on('close', () => {
				fs.chmodSync(joltronDest, 0755);
				fs.writeFileSync(
					path.resolve(buildDir, '..', '.manifest'),
					JSON.stringify({
						version: 2,
						gameInfo: {
							dir: config.platformArch,
							uid: '119886-282275',
							archiveFiles: ['./path/to/contents'],
							platformUrl: gjHost + '/x/updater/check-for-updates',
						},
						launchOptions: { executable: executable },
						os: config.platform,
						arch: config.arch + '',
						isFirstInstall: false,
					}),
					'utf8'
				);
				cb();
			});
	});

	gulp.task(
		'client',
		gulp.series(
			'client:node-modules',
			'client:nw',
			'client:nw-unpackage',
			'client:package',
			'client:joltron'
		)
	);
};
