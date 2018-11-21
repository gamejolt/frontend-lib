const gulp = require('gulp');
const gutil = require('gulp-util');
const path = require('path');
const os = require('os');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackDevServer = require('webpack-dev-server');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const WriteFilePlugin = require('write-file-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const OptimizeCssnanoPlugin = require('@intervolga/optimize-cssnano-plugin');

module.exports = function (config) {
	let base = path.resolve(config.projectBase);

	let noop = function () {};
	let devNoop = !config.production ? noop : undefined;
	let prodNoop = config.production ? noop : undefined;

	let browserNoop = !config.server ? noop : undefined;
	let serverNoop = config.server ? noop : undefined;

	let clientNoop = config.client ? noop : undefined;
	let siteNoop = !config.client ? noop : undefined;

	let externals = {};
	if (!config.client) {
		// When building for site, we don't want any of these imports accidentally being pulled in.
		// Setting these to empty object strings causes the require to return an empty object.
		externals['client-voodoo'] = '{}';
		externals['sanitize-filename'] = '{}';

		// fs-extra and write-file-atomic is used by the client to write the localdb json file.
		externals['fs-extra'] = '{}';
		externals['write-file-atomic'] = '{}';
	} else {
		// This format sets the externals to just straight up "require('axios')" so it can pull it
		// directly and not pull in through webpack's build process. We need this for axios since it
		// treats it as a "node" project instead of "browser". It didn't work to include axios in
		// here, but rather just its own dependencies.
		externals['follow-redirects'] = 'commonjs follow-redirects';
		externals['is-buffer'] = 'commonjs is-buffer';

		// We don't want to pull client-voodoo into the build so that it can get proper paths
		// through variables like __dirname and such.
		externals['client-voodoo'] = 'commonjs client-voodoo';

		// fs-extra and write-file-atomic is used by the client to write the localdb json file.
		externals['fs-extra'] = 'commonjs fs-extra';
		externals['write-file-atomic'] = 'commonjs write-file-atomic';
	}

	let webpackTarget = 'web';
	if (config.server) {
		webpackTarget = 'node';
	} else if (config.client) {
		webpackTarget = 'node-webkit';
	}

	let libraryTarget = 'var';
	if (config.server) {
		libraryTarget = 'commonjs2';
	}

	let devtool = 'source-map';
	if (!config.production) {
		if (!config.server) {
			// eval doesn't allow breakpoitns, inline does
			devTool = 'cheap-module-eval-source-map';
		}
	} else if (config.client) {
		devtool = false;
	}

	function stylesLoader() {
		const loaders = [{
				loader: 'css-loader',
				options: {
					sourceMap: false,
					// How many loaders run before this.
					importLoaders: 2
				}
			},
			{
				loader: 'postcss-loader',
				options: {
					sourceMap: false
				}
			},
		];

		if (config.production && !config.server) {
			loaders.unshift(MiniCssExtractPlugin.loader);
		} else {
			loaders.unshift({
				loader: 'vue-style-loader',
				options: {
					sourceMap: false,
					shadowMode: false
				}
			});
		}

		return loaders;
	}

	let webpackSectionConfigs = {};
	let webpackSectionTasks = [];
	Object.keys(config.sections).forEach(function (section) {
		const sectionConfig = config.sections[section];

		let appEntries = ['./' + section + '/main.ts'];
		let indexHtml = section === 'app' ? 'index.html' : section + '.html';

		if (!config.production) {
			appEntries.push('webpack-dev-server/client?http://localhost:' + config.port + '/');
			appEntries.push('webpack/hot/dev-server');
		}

		let entry = {
			app: appEntries,
		};

		if (config.server) {
			entry = {
				server: ['./' + section + '/server.ts'],
			};
		}

		let publicPath = '/';
		if (!config.client && config.production) {
			publicPath = config.staticCdn + publicPath;
		} else if (config.client && !config.watching) {
			// On linux/win we put all the files in a folder called "package".
			if (config.platform !== 'osx') {
				publicPath = '/package/';
			}
		}

		let webAppManifest = undefined;
		if (!config.server && !config.client && sectionConfig.webAppManifest) {
			webAppManifest = sectionConfig.webAppManifest;

			for (const icon of webAppManifest.icons) {
				icon.src = path.resolve(base, 'src/app/img/touch/' + icon.src);
			}
		}

		let hasOfflineSupport = !config.server && !config.client && config.production && sectionConfig.offline;

		webpackSectionConfigs[section] = {
			mode: config.production ? 'production' : 'development',
			entry,
			target: webpackTarget,
			context: path.resolve(base, 'src'),
			node: {
				__filename: true,
				__dirname: true,
			},
			devServer: {
				outputPath: path.resolve(base, config.buildDir),
			},
			output: {
				publicPath: publicPath,
				path: path.resolve(base, config.buildDir),
				filename: config.production ? section + '.[contenthash:8].js' : section + '.[name].js',
				chunkFilename: config.production ? section + '.[contenthash:8].js' : section + '.[name].js',
				sourceMapFilename: config.production ? 'maps/[contenthash:8].map' : 'maps/[name].map',
				libraryTarget: libraryTarget,
			},
			resolve: {
				extensions: ['.tsx', '.ts', '.js', '.styl'],
				modules: [path.resolve(base, 'src/vendor'), 'node_modules'],
				alias: {
					// Always "app" base img.
					img: path.resolve(base, 'src/app/img'),
					styles: path.resolve(base, 'src/' + section + '/styles'),
					'styles-lib': path.resolve(config.gjLibDir, 'stylus/common'),
				},
			},
			externals: externals,
			resolveLoader: {
				alias: {
					view: 'vue-template-loader?' +
						JSON.stringify({
							scoped: true,
							transformAssetUrls: {
								img: 'src',
								'app-theme-svg': 'src',
							},
						}),
				},
			},
			module: {
				rules: [{
						test: /\.ts$/,
						use: [{
								loader: 'cache-loader',
								options: {
									cacheDirectory: path.resolve(base, '.cache/ts-loader'),
								}
							},
							{
								loader: 'ts-loader',
								options: {
									transpileOnly: true,
								},
							},
						],
					},
					{
						test: /\.styl$/,
						use: [{
							loader: 'stylus-loader',
							options: {
								use: [],
								paths: [
									'src/',
								],
								'resolve url': true,
								'include css': true,
								preferPathResolver: 'webpack',
								sourceMap: false,
							}
						}]
					},
					{
						enforce: 'post',
						test: /\.styl$/,
						use: stylesLoader(),
					},
					{
						enforce: 'post',
						test: /\.css$/,
						use: stylesLoader(),
					},
					{
						test: /\.md$/,
						use: ['html-loader', 'markdown-loader'],
					},
					{
						test: /\.(png|jpe?g|gif|svg|ogg|mp4)(\?.*)?$/,
						use: [{
							loader: 'file-loader',
							options: {
								name: 'assets/[name].[hash:8].[ext]',
							}
						}],
						exclude: /node_modules/,
					},
					{
						test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
						use: [{
							loader: 'file-loader',
							options: {
								name: 'assets/[name].[hash:8].[ext]',
							}
						}]
					},
					{
						test: /\.json$/,
						resourceQuery: /file/,
						loader: 'file-loader',
						type: 'javascript/auto',
						options: {
							name: 'assets/[name].[hash:8].[ext]',
						}
					},
				],
			},
			devtool,
			optimization: config.production && !config.server ? {
				splitChunks: {
					// Does chunk splitting logic for entry point chunks as well.
					// https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
					chunks: 'all',
				},
				// Splits the runtime into its own chunk for long-term caching.
				runtimeChunk: 'single',
			} : undefined,
			plugins: [
				prodNoop || new webpack.ProgressPlugin(),
				new webpack.DefinePlugin({
					GJ_SECTION: JSON.stringify(section),
					GJ_ENVIRONMENT: JSON.stringify(
						!config.developmentEnv ? 'production' : 'development'
					),
					GJ_BUILD_TYPE: JSON.stringify(config.production ? 'production' : 'development'),
					GJ_IS_CLIENT: JSON.stringify(!!config.client),
					GJ_IS_SSR: JSON.stringify(config.server),
					GJ_VERSION: JSON.stringify(
						require(path.resolve(process.cwd(), 'package.json')).version
					),
					GJ_MANIFEST_URL: JSON.stringify(
						require(path.resolve(process.cwd(), 'package.json')).clientManifestUrl
					),
					GJ_WITH_UPDATER: JSON.stringify(
						(!config.developmentEnv && !config.watching) || config.withUpdater
					),
					GJ_IS_WATCHING: JSON.stringify(config.watching),
				}),
				new CopyWebpackPlugin([{
					context: path.resolve(base, 'src/static-assets'),
					from: '**/*',
					to: 'static-assets',
				}, ]),
				// Copy over stupid client stuff that's needed.
				siteNoop || new CopyWebpackPlugin([{
						from: path.join(base, 'package.json'),
						to: 'package.json',
						transform: (content, _path) => {
							const pkg = JSON.parse(content);

							// We don't want to install dev/optional deps into the client build.
							// We only need those when building the client, not for runtime.
							delete pkg.devDependencies;
							delete pkg.optionalDependencies;
							delete pkg.scripts;

							return JSON.stringify(pkg);
						},
					},
					{
						from: 'update-hook.js',
						to: 'update-hook.js',
					},
				]),
				devNoop || serverNoop || new ImageminPlugin(),
				prodNoop || serverNoop || new webpack.HotModuleReplacementPlugin(),
				devNoop || serverNoop || new MiniCssExtractPlugin({
					filename: section + '.[contenthash:8].css',
					chunkFilename: section + '.[contenthash:8].css',
				}),
				devNoop || new OptimizeCssnanoPlugin({
					sourceMap: false,
					cssnanoOptions: {
						preset: [
							'default',
							{
								mergeLonghand: false,
								cssDeclarationSorter: false
							}
						]
					}
				}),
				serverNoop || new HtmlWebpackPlugin({
					filename: indexHtml,
					template: 'index.html',
					favicon: 'app/img/favicon.png',
					inject: true,
					chunksSortMode: 'none',

					// Our own vars for injection into template.
					templateParameters: {
						_section: section,
						_isClient: config.client,
						_title: sectionConfig.title,
						_crawl: sectionConfig.crawl,
						_scripts: sectionConfig.scripts,
						_bodyClass: sectionConfig.bodyClass || '',
					}
				}),
				webAppManifest ? new WebpackPwaManifest(webAppManifest) : noop,
				prodNoop || new FriendlyErrorsWebpackPlugin(),
				serverNoop || clientNoop || new VueSSRClientPlugin({
					filename: 'vue-ssr-client-manifest-' + section + '.json',
				}),
				browserNoop || clientNoop || new VueSSRServerPlugin({
					filename: 'vue-ssr-server-bundle-' + section + '.json',
				}),
				hasOfflineSupport ? new OfflinePlugin({
					excludes: ['**/.*', '**/*.map', 'vue-ssr-*', '**/*gameApiDocContent*'],
					ServiceWorker: {
						events: true,
						output: 'sjw.js',
						publicPath: 'https://gamejolt.com/sjw.js',
					},
				}) : noop,
				devNoop || new webpack.HashedModuleIdsPlugin(),
				config.write ? new WriteFilePlugin() : noop,
				config.analyze ? new BundleAnalyzerPlugin() : noop,
			],
		};

		gulp.task('compile:' + section, function (cb) {
			let compiler = webpack(webpackSectionConfigs[section]);
			compiler.run(function (err, stats) {
				if (err) {
					throw new gutil.PluginError('webpack:build', err);
				}

				gutil.log(
					'[webpack:build]',
					stats.toString({
						chunks: false,
						colors: true,
					})
				);

				cb();
			});
		});

		webpackSectionTasks.push('compile:' + section);
	});

	gulp.task(
		'watch',
		gulp.series('clean', function (cb) {
			const buildSections = config.buildSection.split(',');
			let port = parseInt(config.port),
				portOffset = 0;
			for (let buildSection of buildSections) {
				console.log('watching ' + buildSection + ' on port ' + (port + portOffset));

				let compiler = webpack(webpackSectionConfigs[buildSection]);

				let server = new WebpackDevServer(compiler, {
					historyApiFallback: {
						rewrites: [{
							from: /./,
							to: buildSection === 'app' ?
								'/index.html' : '/' + buildSection + '.html',
						}, ],
					},
					public: 'development.gamejolt.com',
					quiet: true,
					hot: !config.server,
				});

				if (!config.server) {
					server.listen(port + portOffset, 'localhost');
				}
				portOffset += 1;
			}
		})
	);

	if (!config.noClean) {
		webpackSectionTasks.unshift('clean');
	}

	webpackSectionTasks.unshift('translations:compile');

	if (config.client && !config.watching) {
		webpackSectionTasks.push('client');
	}

	gulp.task('default', gulp.series(webpackSectionTasks));
};
