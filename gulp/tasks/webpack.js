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

	const externalModules = [];
	if (!config.client) {
		externalModules.push('nw.gui', 'client-voodoo', 'sanitize-filename');
	}

	let externals = {};
	for (let extern of externalModules) {
		externals[extern] = {
			commonjs: extern,
			commonjs2: extern,
		};
	}

	if (config.server) {
		Object.assign(
			externals,
			nodeExternals({
				// do not externalize dependencies that need to be processed by webpack.
				// you can add more file types here e.g. raw *.vue files
				// you should also whitelist deps that modifies `global` (e.g. polyfills)
				whitelist: /\.css$/,
			})
		);
	}

	const cleanCssOptions = {
		level: 2,
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
	config.sections.forEach(function(section) {
		let indexHtml = section === 'app' ? 'index.html' : section + '.html';
		let appEntries = [path.resolve(base, 'src/' + section + '/main.ts')];

		if (!config.production) {
			appEntries.push('webpack-dev-server/client?http://localhost:' + config.port + '/');
			appEntries.push('webpack/hot/dev-server');
		}

		let entry = {
			app: appEntries,
		};

		if (config.server) {
			entry = {
				server: [path.resolve(base, 'src/' + section + '/server.ts')],
			};
		}

		let publicPath = '/';
		if (config.production && !config.client) {
			publicPath = config.staticCdn + publicPath;
		}

		let webAppManifest = undefined;
		if (
			!config.server &&
			!config.client &&
			config.webAppManifest &&
			config.webAppManifest[section]
		) {
			webAppManifest = config.webAppManifest[section];

			for (const icon of webAppManifest.icons) {
				icon.src = path.resolve(base, 'src/app/img/touch/' + icon.src);
			}
		}

		let hasOfflineSupport =
			!config.server &&
			!config.client &&
			config.production &&
			config.offlineSupport &&
			config.offlineSupport.indexOf(section) !== -1;

		webpackSectionConfigs[section] = {
			entry,
			target: webpackTarget,
			context: path.resolve(base, config.buildDir),
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
				filename: config.production ? section + '.[name].[chunkhash:6].js' : section + '.[name].js',
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
					GJ_ENVIRONMENT: JSON.stringify(!config.developmentEnv ? 'production' : 'development'),
					GJ_BUILD_TYPE: JSON.stringify(config.production ? 'production' : 'development'),
					GJ_IS_CLIENT: JSON.stringify(!!config.client),
					GJ_IS_SSR: JSON.stringify(config.server),
					GJ_VERSION: JSON.stringify(require(path.resolve(process.cwd(), 'package.json')).version),

					// This sets vue in production mode.
					'process.env.NODE_ENV': JSON.stringify(config.production ? 'production' : 'development'),
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
				siteNoop ||
					new CopyWebpackPlugin([
						{
							from: path.resolve(base, 'package.json'),
							to: 'package.json',
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
							return module.context && module.context.indexOf('node_modules') !== -1;
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
						template: '!!html-loader?interpolate=require!src/' + indexHtml,
						favicon: path.resolve(base, 'src/app/img/favicon.png'),
						inject: true,
						chunksSortMode: 'dependency',
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
								config.buildSection === 'app' ? '/index.html' : '/' + config.buildSection + '.html',
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
