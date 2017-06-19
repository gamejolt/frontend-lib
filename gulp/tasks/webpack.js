const gulp = require('gulp');
const gutil = require('gulp-util');
const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackDevServer = require('webpack-dev-server');
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CleanCss = require('clean-css');
const WriteFilePlugin = require('write-file-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
	.BundleAnalyzerPlugin;
const VueSSRPlugin = require('vue-ssr-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function(config) {
	let base = path.resolve(config.projectBase);

	let noop = function() {};
	let devNoop = config.production ? undefined : noop;
	let prodNoop = !config.production ? undefined : noop;
	let serverNoop = !config.server ? undefined : noop;

	let externals = {};
	for (let extern of ['nw.gui', 'client-voodoo']) {
		externals[extern] = extern;
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
		libraryTarget = 'commonjs';
	}

	function stylesLoader(loaders, options) {
		// Note: style-loader doesn't work on the server.

		if (config.production) {
			loaders.push({
				loader: 'clean-css-loader',
				options: cleanCssOptions,
			});

			return ExtractTextPlugin.extract({
				fallback: !config.server ? 'style-loader' : undefined,
				use: loaders,
			});
		}

		if (!config.server) {
			loaders.unshift('style-loader');
		}

		return loaders;
	}

	let webpackSectionConfigs = {};
	let webpackSectionTasks = [];
	config.sections.forEach(function(section) {
		let indexHtml = section === 'app' ? 'index.html' : section + '.html';

		let appEntries = [
			path.resolve(base, 'src/' + section + '/main.styl'),
			path.resolve(base, 'src/' + section + '/main.ts'),
		];

		if (!config.production) {
			appEntries.push(
				'webpack-dev-server/client?http://localhost:' + config.port + '/'
			);
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

		webpackSectionConfigs[section] = {
			entry,
			target: webpackTarget,
			devServer: {
				outputPath: path.resolve(base, config.buildDir),
			},
			output: {
				publicPath: (config.production ? config.staticCdn : '') + '/',
				path: path.resolve(base, config.buildDir),
				filename: config.production
					? section + '.[name].[chunkhash:6].js'
					: section + '.[name].js',
				chunkFilename: config.production
					? section + '.[name].[id].[chunkhash:6].js'
					: undefined,
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
								// God save us.
								loader: 'string-replace-loader',
								options: {
									search: /\$import\(/g,
									replace: 'import(',
								},
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
						test: /\.js$/,
						use: [
							{
								// God save us.
								loader: 'string-replace-loader',
								options: {
									search: /\$import\(/g,
									replace: 'import(',
								},
							},
						],
						exclude: /node_modules/,
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
						test: /\.md$/,
						use: [
							'file-loader?name=templates/[name].[hash:6].html',
							'extract-loader',
							'html-loader',
							'markdown-loader',
						],
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
			// Inline allows us to debug by setting breakpoints.
			// Eval may be faster, but it doesn't allow setting breakpoints.
			devtool: !config.server
				? 'cheap-module-inline-source-map'
				: '#source-map',
			plugins: [
				new webpack.DefinePlugin({
					GJ_ENVIRONMENT: JSON.stringify(
						!config.developmentEnv ? 'production' : 'development'
					),
					GJ_BUILD_TYPE: JSON.stringify(
						config.production ? 'production' : 'development'
					),
					GJ_IS_CLIENT: JSON.stringify(config.client),
					GJ_IS_SSR: JSON.stringify(config.server),
					GJ_VERSION: JSON.stringify(
						require(path.resolve(process.cwd(), 'package.json')).version
					),

					// This sets vue in production mode.
					'process.env': {
						NODE_ENV: JSON.stringify(
							config.production ? 'production' : 'development'
						),
					},
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
				// !config.client ? noop : new CopyWebpackPlugin([
				// 	{
				// 		from: path.resolve( base, 'client-package.json' ),
				// 		to: 'package.json',
				// 	},
				// ]),
				devNoop ||
					new webpack.optimize.UglifyJsPlugin({
						compress: {
							warnings: false,
							screw_ie8: true,
						},
					}),
				devNoop || new ImageminPlugin(),
				prodNoop || serverNoop || new webpack.HotModuleReplacementPlugin(),

				// Pull out vendor code from the main entry point.
				devNoop ||
					new webpack.optimize.CommonsChunkPlugin({
						name: 'vendor',
						minChunks: function(module) {
							return (
								module.context &&
								(module.context.indexOf('node_modules') !== -1 ||
									module.context.indexOf('bower-lib') !== -1)
							);
						},
					}),

				// This generates a manifest file that allows our vendor chunk
				// to be cached longer if it doesn't change.
				// More info: https://webpack.js.org/guides/code-splitting-libraries/#implicit-common-vendor-chunk
				devNoop ||
					new webpack.optimize.CommonsChunkPlugin({
						name: 'manifest',
					}),

				serverNoop || new ExtractTextPlugin('[name].[contenthash:6].css'),
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
						excludeChunks: ['server'],
					}),
				prodNoop || new FriendlyErrorsWebpackPlugin(),
				!config.server
					? noop
					: new VueSSRPlugin({
							entry: 'server',
						}),
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
		gulp.series('clean:pre', function(cb) {
			let compiler = webpack(webpackSectionConfigs[config.buildSection]);

			let server = new WebpackDevServer(compiler, {
				historyApiFallback: {
					rewrites: [
						{
							from: /./,
							to: config.buildSection === 'app'
								? '/index.html'
								: '/' + config.buildSection + '.html',
						},
					],
				},
				quiet: true,
				hot: !config.server,
				watchOptions: {
					aggregateTimeout: 300,
				},
			});

			if (!config.server) {
				server.listen(config.port, 'localhost');
			}
		})
	);

	gulp.task('compile', gulp.series(webpackSectionTasks));
	gulp.task(
		'default',
		gulp.series('clean:pre', 'translations:compile', 'compile')
	);
};
