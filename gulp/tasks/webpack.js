const gulp = require('gulp');
const gutil = require('gulp-util');
const path = require('path');
const os = require('os');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackDevServer = require('webpack-dev-server');
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CleanCss = require('clean-css');
const WriteFilePlugin = require('write-file-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const OfflinePlugin = require('offline-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

module.exports = function(config) {
	let base = path.resolve(config.projectBase);

	let noop = function() {};
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
		externals['nwjs-snappy-updater'] = '{}';
		externals['sanitize-filename'] = '{}';
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

		// we need nwjs-snappy-updater to not be bundled in because it contains a dynamic require
		// for the update-hook.js that webpack flips tables over, but if we exclude nwjs-snappy-updater
		// from the bundle, it's dependecies will not be transpiled to es5.
		// We define a specific function to exclude that returns the node's require so we can use it
		// to reload the update hook without webpack complaining about a dynamic export. sheesh.
		externals['download'] = 'commonjs download';
	}

	// Didn't seem to work. Not sure if we need it, though.
	// if (config.server) {
	// 	// For server builds, keep the node stuff external so that it can make smaller server
	// 	// builds.
	// 	externals = nodeExternals({
	// 		// do not externalize dependencies that need to be processed by webpack.
	// 		// you can add more file types here e.g. raw *.vue files
	// 		// you should also whitelist deps that modifies `global` (e.g. polyfills)
	// 		whitelist: /\.css$/,
	// 	});
	// }

	const cleanCssOptions = {
		level: 1,
	};

	let cleanCss = new CleanCss(cleanCssOptions);

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

	// Inline allows us to debug by setting breakpoints.
	// Eval may be faster, but it doesn't allow setting breakpoints.
	let devtool = 'source-map';
	if (!config.production) {
		if (config.server) {
			devTool = 'source-map';
		} else if (config.client) {
			// The old node-webkit versions of the client (currently 0.12.3) have trouble processing inline source maps in webpack 2.
			// They have an issue with the //# prefix. Using @ forces it back to webpack 1's //@ for inline sourcemaps.
			devTool = '@cheap-module-inline-source-map';
		} else {
			devTool = 'cheap-module-inline-source-map';
		}
	} else if (config.client) {
		devtool = false;
	}

	function stylesLoader(loaders, options) {
		if (config.production) {
			loaders.push({
				loader: 'clean-css-loader',
				options: cleanCssOptions,
			});

			return ExtractTextPlugin.extract({
				use: loaders,
				fallback: 'vue-style-loader',
			});
		}

		loaders.unshift('vue-style-loader');

		return loaders;
	}

	let webpackSectionConfigs = {};
	let webpackSectionTasks = [];
	Object.keys(config.sections).forEach(function(section) {
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
		if (config.production) {
			if (!config.client) {
				publicPath = config.staticCdn + publicPath;
			} else {
				// On linux/win we put all the files in a folder called "package".
				if (config.platform !== 'osx') {
					publicPath = '/package/';
				}
			}
		}

		let webAppManifest = undefined;
		if (!config.server && !config.client && sectionConfig.webAppManifest) {
			webAppManifest = sectionConfig.webAppManifest;

			for (const icon of webAppManifest.icons) {
				icon.src = path.resolve(base, 'src/app/img/touch/' + icon.src);
			}
		}

		let hasOfflineSupport =
			!config.server && !config.client && config.production && sectionConfig.offline;

		webpackSectionConfigs[section] = {
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
				filename: config.production
					? section + '.[name].[chunkhash:6].js'
					: section + '.[name].js',
				chunkFilename: config.production
					? section + '.[name].[chunkhash:6].js'
					: section + '.[name].js',
				sourceMapFilename: 'maps/[name].[chunkhash:6].map',
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
					view:
						'vue-template-loader?' +
						JSON.stringify({
							scoped: true,
							transformToRequire: {
								img: 'src',
								'app-theme-svg': 'src',
							},
						}),
				},
			},
			module: {
				rules: [
					{
						test: /\.tsx?$/,
						use: [
							{
								loader: 'ts-loader',
								options: {
									transpileOnly: true,
								},
							},
						],
					},
					{
						enforce: 'pre',
						test: /\.styl$/,
						use: 'stylus-loader?paths[]=src/&resolve url&include css',
					},
					{
						enforce: 'post',
						test: /\.styl$/,
						use: stylesLoader([
							'css-loader?-minimize',
							{ loader: 'postcss-loader', options: { sourceMap: true } },
						]),
					},
					{
						test: /\.css$/,
						use: stylesLoader([
							'css-loader?-minimize',
							{ loader: 'postcss-loader', options: { sourceMap: true } },
						]),
					},
					{
						test: /\.md$/,
						use: ['html-loader', 'markdown-loader'],
					},
					{
						test: /\.(png|jpe?g|gif|svg|json|ogg|mp4)(\?.*)?$/,
						loader: 'file-loader?name=assets/[name].[hash:6].[ext]',
						exclude: /node_modules/,
					},
					{
						test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
						loader: 'file-loader?name=assets/[name].[hash:6].[ext]',
					},
				],
			},
			devtool,
			plugins: [
				// We use this in prod build too since gzip is able to zip up
				// path names better than hashed module IDs resulting in smaller
				// file sizes.
				new webpack.NamedModulesPlugin(),
				new webpack.NamedChunksPlugin(),
				// Hoists modules instead of using a function call when it can.
				devNoop || new webpack.optimize.ModuleConcatenationPlugin(),
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

					// This sets vue in production mode.
					'process.env.NODE_ENV': JSON.stringify(
						config.production ? 'production' : 'development'
					),
				}),
				new webpack.LoaderOptionsPlugin({
					options: {
						// Fix extract-loader: https://github.com/peerigon/extract-loader/issues/16
						output: {},
						htmlLoader: {
							minimize: config.production,
						},
						stylus: {
							use: [],
							preferPathResolver: 'webpack',
						},
					},
				}),
				new CopyWebpackPlugin([
					{
						context: path.resolve(base, 'src/static-assets'),
						from: '**/*',
						to: 'static-assets',
					},
				]),
				// Copy over stupid client stuff that's needed.
				siteNoop ||
					new CopyWebpackPlugin([
						{
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
				devNoop ||
					new webpack.optimize.UglifyJsPlugin({
						sourceMap: true,
						compress: {
							warnings: false,
							screw_ie8: true,
						},
					}),
				devNoop || new ImageminPlugin(),
				prodNoop || serverNoop || new webpack.HotModuleReplacementPlugin(),

				// Since form stuff is so large, we split it into an async chunk
				// that will get loaded alongside any chunks that need it.
				devNoop ||
					clientNoop ||
					serverNoop ||
					new webpack.optimize.CommonsChunkPlugin({
						name: 'app',
						async: 'forms',
						minChunks: function(module) {
							return (
								module.context &&
								(module.context.indexOf('vee-validate') !== -1 ||
									module.context.indexOf('gj-lib-client/components/form') !== -1)
							);
						},
					}),

				// Pull out vendor code from the main entry point.
				devNoop ||
					clientNoop ||
					serverNoop ||
					new webpack.optimize.CommonsChunkPlugin({
						name: 'vendor',
						minChunks: function(module) {
							return (
								module.context &&
								module.context.indexOf('node_modules') !== -1 &&
								// Don't pull styles into a vendor stylesheet (not worth it).
								module.resource.indexOf('.css') === -1
							);
						},
					}),

				// This generates a manifest file that allows our vendor chunk
				// to be cached longer if it doesn't change.
				// More info: https://webpack.js.org/guides/code-splitting-libraries/#implicit-common-vendor-chunk
				devNoop ||
					clientNoop ||
					serverNoop ||
					new webpack.optimize.CommonsChunkPlugin({
						name: 'manifest',
						minChunks: Infinity,
					}),

				devNoop || new ExtractTextPlugin('[name].[contenthash:6].css'),
				devNoop ||
					new OptimizeCssPlugin({
						cssProcessor: {
							process: function(css) {
								return new Promise(function(resolve, reject) {
									let output = cleanCss.minify(css);
									if (output.errors.length) {
										reject(output.errors);
									} else {
										resolve({
											css: output.styles,
										});
									}
								});
							},
						},
					}),
				serverNoop ||
					new HtmlWebpackPlugin({
						filename: indexHtml,
						template: 'index.html',
						favicon: 'app/img/favicon.png',
						inject: true,
						chunksSortMode: 'dependency',

						// Our own vars for injection into template.
						_section: section,
						_isClient: config.client,
						_title: sectionConfig.title,
						_crawl: sectionConfig.crawl,
						_scripts: sectionConfig.scripts,
						_bodyClass: sectionConfig.bodyClass || '',
					}),
				webAppManifest ? new WebpackPwaManifest(webAppManifest) : noop,
				prodNoop || new FriendlyErrorsWebpackPlugin(),
				serverNoop ||
					clientNoop ||
					new VueSSRClientPlugin({
						filename: 'vue-ssr-client-manifest-' + section + '.json',
					}),
				browserNoop ||
					clientNoop ||
					new VueSSRServerPlugin({
						filename: 'vue-ssr-server-bundle-' + section + '.json',
					}),
				hasOfflineSupport
					? new OfflinePlugin({
							excludes: ['**/.*', '**/*.map', 'vue-ssr-*', '**/*gameApiDocContent*'],
							ServiceWorker: {
								events: true,
								output: 'sjw.js',
								publicPath: 'https://gamejolt.com/sjw.js',
							},
						})
					: noop,
				config.write ? new WriteFilePlugin() : noop,
				config.analyze ? new BundleAnalyzerPlugin() : noop,
			],
		};

		gulp.task('compile:' + section, function(cb) {
			let compiler = webpack(webpackSectionConfigs[section]);
			compiler.run(function(err, stats) {
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
		gulp.series('clean', function(cb) {
			let compiler = webpack(webpackSectionConfigs[config.buildSection]);

			let server = new WebpackDevServer(compiler, {
				historyApiFallback: {
					rewrites: [
						{
							from: /./,
							to:
								config.buildSection === 'app'
									? '/index.html'
									: '/' + config.buildSection + '.html',
						},
					],
				},
				public: 'development.gamejolt.com',
				quiet: true,
				hot: !config.server,
			});

			if (!config.server) {
				server.listen(config.port, 'localhost');
			}
		})
	);

	if (!config.noClean) {
		webpackSectionTasks.unshift('clean');
	}

	webpackSectionTasks.unshift('translations:compile');

	if (config.client && config.production) {
		webpackSectionTasks.push('client');
	}

	gulp.task('default', gulp.series(webpackSectionTasks));
};
