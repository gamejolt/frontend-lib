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
const readdir = require('fs-readdir-recursive');
const https = require('follow-redirects').https;
const DecompressZip = require('decompress-zip');
const cp = require('child_process');
const http = require('http');

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
					// 'ln -s ' + devDep + ' ' + buildDep
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
		// note that on mac, the installer will unpack a self updating app and contain this NW executable entirely within itself.
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

	const gjpushVersion = 'v0.1.0';

	let gjpushExecutable = '';
	let remoteExecutable = '';

	switch (config.platform) {
		case 'win':
			gjpushExecutable = path.join(config.clientBuildDir, 'gjpush.exe');
			break;
		case 'osx':
			gjpushExecutable = path.join(config.clientBuildDir, 'gjpush');
			break;
		default:
			gjpushExecutable = path.join(config.clientBuildDir, 'gjpush');
			break;
	}

	/**
	 * Downloads the gjpush binary used to push the package and installers to GJ automatically.
	 */
	gulp.task('client:get-gjpush', cb => {
		// In development we want to grab a development variant of it,
		// so we simply copy it over from its Go repo into our build dir.
		if (config.developmentEnv) {
			cp.execSync(
				'cp "' +
					path.join(
						process.env.GOPATH,
						'src',
						'github.com',
						'gamejolt',
						'cli',
						path.basename(gjpushExecutable)
					) +
					'" "' +
					gjpushExecutable +
					'"'
			);
			cb();
			return;
		}

		// In prod we fetch the binary from the github releases page.
		// It is zipped on Github because we didn't want to have OS specific filenames like gjpush-win32.exe
		// so we distinguish the OS by the zip name which then contains gjpush.exe for windows or just gjpush for mac/linux.
		let remoteExecutable = '';
		switch (config.platform) {
			case 'win':
				remoteExecutable = 'windows.zip';
				break;
			case 'osx':
				remoteExecutable = 'osx.zip';
				break;
			default:
				remoteExecutable = 'linux.zip';
				break;
		}
		const options = {
			host: 'github.com',
			path: '/gamejolt/cli/releases/download/' + gjpushVersion + '/' + remoteExecutable,
		};

		const gjpushZip = path.join(config.clientBuildDir, 'gjpush.zip');
		const file = fs.createWriteStream(gjpushZip);

		// Download the gjpush zip.
		return new Promise((resolve, reject) => {
			https
				.get(options, res => {
					if (res.statusCode !== 200) {
						return reject(
							new Error('Invalid status code. Expected 200 got ' + res.statusCode)
						);
					}

					res.pipe(file);
					res.on('end', () => {
						file.close();
						resolve();
					});
				})
				.on('error', err => {
					reject(err);
				})
				.end();
		})
			.then(() => {
				// Extract it to our client build folder.
				return new Promise((resolve, reject) => {
					const unzipper = new DecompressZip(gjpushZip);

					unzipper.on('error', reject);
					unzipper.on('extract', () => resolve());
					unzipper.extract({ path: config.clientBuildDir });
				});
			})
			.then(() => {
				// Ensure the gjpush binary is executable.
				fs.chmodSync(gjpushExecutable, 0o755);
			});
	});

	const gjServiceApiToken = '78378_token';
	const gjGameId = 119176;
	const gjGamePackageId = 331094;
	const gjGameInstallerPackageId = 331095;

	/**
	 * Pushes the single package to GJ.
	 * The package is one complete standalone version of the client.
	 * It is not the package shipped with joltron so it doesn't use the new auto updater.
	 * It's essentially the "game" people upload to GJ.
	 */
	gulp.task('client:gjpush-package', () => {
		let p = Promise.resolve();

		// On mac we have to zip the app so we can upload it.
		if (config.platform === 'osx') {
			p = new Promise((resolve, reject) => {
				const stream = gulp
					.src(config.clientBuildDir + '/build/' + config.platformArch + '/**/*')
					.pipe(plugins.zip(config.platformArch + '-package.zip'))
					.pipe(gulp.dest(config.clientBuildDir));

				stream.on('end', resolve);
				stream.on('error', reject);
			});
		}

		// GJPUSH!
		// We trust the exit codes to tell us if something went wrong because a non 0 exit code will make this throw.
		return p.then(() => {
			cp.execFileSync(gjpushExecutable, [
				'-t',
				gjServiceApiToken,
				'-g',
				gjGameId,
				'-p',
				gjGamePackageId,
				'-r',
				packageJson.version,
				path.join(config.clientBuildDir, config.platformArch + '-package.zip'),
			]);
		});
	});

	/**
	 * Structured the build folder with joltron, as if it was installed by it.
	 * This is what we want our installer to unpack.
	 */
	gulp.task('client:joltron', cb => {
		// Function to issue an authenticated service API request and return the result as json..
		let serviceApiRequest = url => {
			let options = {
				hostname: 'development.gamejolt.com',
				path: '/service-api/push' + url,
				method: 'GET',
				headers: { 'Content-Type': 'application/json', Authorization: gjServiceApiToken },
			};

			return new Promise((resolve, reject) => {
				http
					.request(options, res => {
						res.setEncoding('utf8');

						let str = '';
						res
							.on('data', data => {
								str += data;
							})
							.on('end', () => {
								resolve(JSON.parse(str));
							});
					})
					.on('error', reject)
					.end();
			});
		};

		// We need to know our build ID for the package zip we just uploaded,
		// because the build id is part of the game UID ("packageId-buildId)"
		// which we need for joltron's manifest file.
		// So we can use the service API to query it!

		// First step is getting the release ID matching the version we just uploaded.
		return serviceApiRequest(
			'/releases/by_version/' + gjGamePackageId + '/' + packageJson.version
		)
			.then(data => {
				// Then find the builds for that version.
				return serviceApiRequest(
					'/releases/builds/' +
						data.release.id +
						'?game_id=' +
						gjGameId +
						'&package_id=' +
						gjGamePackageId
				);
			})
			.then(data => {
				// The build matching the filename we just uploaded is the build ID we're after.
				return data.builds.data.find(build => {
					return (
						build &&
						build.file &&
						build.file.filename === config.platformArch + '-package.zip'
					);
				});
			})
			.then(build => {
				if (!build) {
					throw new Error('Could not get build');
				}

				// This is joltron's data directory for this client build
				const buildDir = path.resolve(
					config.clientBuildDir,
					'build',
					'data-' + gjGamePackageId + '-' + build.id
				);

				// So rename our build folder (which is the contents of our package zip) to it
				fs.renameSync(
					path.resolve(config.clientBuildDir, 'build', config.platformArch),
					buildDir
				);

				// Next up we want to fetch the same joltron version as the client build is using,
				// even if there is a newer version of joltron released.
				// This ensures the client and joltron can communicate without issues.

				// Figure out the correct client voodoo dir based on the platform.
				let clientVoodooDir = '';
				if (config.platform === 'osx') {
					clientVoodooDir = path.resolve(
						buildDir,
						'Game Jolt Client.app',
						'Contents',
						'Resources',
						'app.nw',
						'node_modules',
						'client-voodoo'
					);
				} else {
					clientVoodooDir = path.resolve(buildDir, 'node_modules', 'client-voodoo');
				}

				// Joltron is located inside client-voodoo/bin folder.
				const joltronSrc = path.resolve(
					clientVoodooDir,
					'bin',
					config.platform === 'win' ? 'GameJoltRunner.exe' : 'GameJoltRunner'
				);

				// Joltron should be placed next to the client build's data folder.
				const joltronDest = path.resolve(
					buildDir,
					'..',
					config.platform === 'win' ? 'joltron.exe' : 'joltron'
				);

				// Some more info is required for joltron's manifest.
				// the correct host is needed for the platformURL - this tells joltron where to look for updates.
				const gjHost = config.developmentEnv
					? 'http://development.gamejolt.com'
					: 'https://gamejolt.com';

				// The executable tells joltron what is the executable file within this client build's data folder.
				let executable = '';
				if (config.platform === 'win') {
					executable = 'GameJoltClient.exe';
				} else if (config.platform === 'osx') {
					executable = 'Game Jolt Client.app/Contents/MacOS/nwjs';
				} else {
					executable = 'game-jolt-client';
				}

				// joltron expects the platform field to be either windows/mac/linux
				let platform = '';
				if (config.platform === 'win') {
					platform = 'windows';
				} else if (config.platform === 'osx') {
					platform = 'mac';
				} else {
					platform = 'linux';
				}

				// Figure out the archive file list.
				const archiveFiles = readdir(buildDir)
					.map(file => './' + file.replace('\\', '/'))
					.sort();

				return new Promise((resolve, reject) => {
					// Finally, copy joltron executable over.
					fs
						.createReadStream(joltronSrc)
						.pipe(fs.createWriteStream(joltronDest))
						.on('error', reject)
						.on('close', () => {
							// Make sure it is executable.
							fs.chmodSync(joltronDest, 0755);

							// Finally create joltron's manifest file
							fs.writeFileSync(
								path.resolve(buildDir, '..', '.manifest'),
								JSON.stringify({
									version: 2,
									gameInfo: {
										dir: path.basename(buildDir),
										uid: gjGamePackageId + '-' + build.id,
										archiveFiles: archiveFiles,
										platformUrl: gjHost + '/x/updater/check-for-updates',
									},
									launchOptions: { executable: executable },
									os: platform,
									arch: config.arch + '',
									isFirstInstall: false,
								}),
								'utf8'
							);
							resolve();
						});
				});
			});
	});

	/**
	 * Packages up the client build as an installer.
	 * This takes the joltron folder structure we generated in the previous steps and packages it up
	 * as an installer for easier distribution
	 */
	gulp.task('client:installer', cb => {
		if (config.platform === 'osx') {
			// On mac we need to create an app that when run will execute joltron.
			// We have a template app we use that contains the minimal setup required.
			const appTemplate = path.resolve(__dirname, 'client', 'Game Jolt Client.app');
			const clientApp = path.resolve(config.clientBuildDir, 'Game Jolt Client.app');

			// We copy it over to the build dir
			cp.execSync('cp -r "' + appTemplate + '" "' + clientApp + '"');

			// We copy the entire joltron folder we generated in the previous step into the app's Contents/Resources/app folder.
			const buildDir = path.join(config.clientBuildDir, 'build');
			const appDir = path.join(clientApp, 'Contents', 'Resources', 'app');

			cp.execSync('cp -r "' + path.join(buildDir, '.') + '" "' + appDir + '"');

			// The info plist in our template has placeholder we need to replace with this build's version
			const infoPlistFile = path.join(clientApp, 'Contents', 'Info.plist');
			const infoPlist = fs
				.readFileSync(infoPlistFile, {
					encoding: 'utf8',
				})
				.replace(/\{\{APP_VERSION\}\}/g, packageJson.version);

			fs.writeFileSync(infoPlistFile, infoPlist, { encoding: 'utf8' });

			// Finally, create a dmg out of the entire app.
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
							path: clientApp,
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
			// TODO most likely broken
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
			// TODO most likely broken
			return gulp
				.src(config.clientBuildDir + '/build/' + config.platformArch + '/**/*')
				.pipe(plugins.tar(config.platformArch + '.tar'))
				.pipe(plugins.gzip())
				.pipe(gulp.dest(config.clientBuildDir));
		}
	});

	/**
	 * Pushes the installer to GJ
	 */
	gulp.task('client:gjpush-installer', cb => {
		// TODO this is probably broken for windows/linux
		let installerFile = '';
		switch (config.platform) {
			case 'win':
				installerFile = 'Setup.exe';
				break;
			case 'osx':
				installerFile = 'osx.dmg';
				break;
			default:
				installerFile = config.platformArch + '.tar.gz';
				break;
		}
		installerFile = path.join(config.clientBuildDir, installerFile);

		cp.execFileSync(gjpushExecutable, [
			'-t',
			gjServiceApiToken,
			'-g',
			gjGameId,
			'-p',
			gjGameInstallerPackageId,
			'-r',
			packageJson.version,
			installerFile,
		]);
		cb();
	});

	gulp.task(
		'client',
		gulp.series(
			'client:node-modules',
			'client:nw',
			'client:get-gjpush',
			'client:gjpush-package',
			'client:joltron',
			'client:installer',
			'client:gjpush-installer'
		)
	);
};
