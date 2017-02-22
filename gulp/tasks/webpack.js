var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var path = require( 'path' );

var webpack = require( 'webpack' );
var HtmlWebpackPlugin = require( 'html-webpack-plugin' );
var FriendlyErrorsWebpackPlugin = require( 'friendly-errors-webpack-plugin' );
var ExtractTextPlugin = require( 'extract-text-webpack-plugin' );
var WebpackDevServer = require( 'webpack-dev-server' );
var OptimizeCssPlugin = require( 'optimize-css-assets-webpack-plugin' );
var ImageminPlugin = require( 'imagemin-webpack-plugin' ).default;
var autoprefixer = require( 'autoprefixer' );
var CleanCss = require( 'clean-css' );
var WriteFilePlugin = require( 'write-file-webpack-plugin' );
var BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' ).BundleAnalyzerPlugin;

module.exports = function( config )
{
	var base = path.resolve( config.projectBase );

	var noop = function(){};
	var devNoop = config.production ? undefined : noop;
	var prodNoop = !config.production ? undefined : noop;

	var externals = {};
	for ( var extern of [ 'nw.gui', 'client-voodoo', 'path', 'os', 'fs' ] ) {
		externals[ extern ] = { commonjs: extern };
	}

	var cleanCss = new CleanCss( {
		level: 2,
	} );

	function stylesLoader( loaders, options )
	{
		if ( config.production ) {
			return ExtractTextPlugin.extract( {
				fallback: 'style-loader',
				use: loaders,
			 } );
		}

		loaders.unshift( 'style-loader' );
		return loaders;
	}

	var webpackSectionConfigs = {};
	var webpackSectionTasks = [];
	config.sections.forEach( function( section )
	{
		var indexHtml = section === 'app' ? 'index.html' : section + '.html';

		var appEntries = [
			path.resolve( base, 'src/' + section + '/main.styl' ),
			path.resolve( base, 'src/' + section + '/main.ts' ),
		];

		if ( !config.production ) {
			appEntries.push( 'webpack-dev-server/client?http://localhost:' + config.port + '/' );
			appEntries.push( 'webpack/hot/dev-server' );
		}

		webpackSectionConfigs[ section ] = {
			entry: {
				app: appEntries,
			},
			devServer: {
				outputPath: path.resolve( base, config.buildDir ),
			},
			output: {
				publicPath: (config.production ? config.staticCdn : '') + '/',
				path: path.resolve( base, config.buildDir ),
				filename: config.production ? section + '.[chunkhash:6].js' : section + '.js',
				chunkFilename: config.production ? section + '.[id].[chunkhash:6].js' : undefined,
			},
			resolve: {
				extensions: [ '.tsx', '.ts', '.js', '.styl' ],
				alias: {
					// Always "app" base img.
					'img': path.resolve( base, 'src/app/img' ),
					'styles': path.resolve( base, 'src/' + section + '/styles' ),
				}
			},
			externals: externals,
			resolveLoader: {
				alias: {
					'view': 'vue-template-loader?scoped',
				}
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
								}
							},
							{
								loader: 'ng-annotate-loader',
								options: {
									add: true,
									map: { inline: true },
								},
							},
							{
								loader: 'ts-loader',
								options: {
									transpileOnly: true,
								}
							},
						],
						exclude: /node_modules/,
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
								}
							},
							{
								loader: 'ng-annotate-loader',
								options: {
									add: true,
									map: { inline: true },
								},
							},
						],
						exclude: /node_modules/,
					},
					// For vue we use the "view" alias.
					config.framework === 'vue' ? {} : {
						test: /\.html$/,
						use: [
							'file-loader?name=templates/[name].[hash:6].[ext]',
							'extract-loader',
							'html-loader',
						],
					},
					// Gotta split it out for vue, but it would be fine with angular as well.
					{
						enforce: 'pre',
						test: /\.styl$/,
						use: 'stylus-relative-loader?paths[]=src/&resolve url&include css',
					},
					{
						enforce: 'post',
						test: /\.styl$/,
						use: stylesLoader( [
							'css-loader?-minimize',
							'postcss-loader',
						] )
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
				]
			},
			// Inline allows us to debug by setting breakpoints.
			// Eval may be faster, but it doesn't allow setting breakpoints.
			devtool: 'cheap-module-inline-source-map',
			plugins: [
				new webpack.DefinePlugin({
					GJ_ENVIRONMENT: JSON.stringify( !config.developmentEnv ? 'production' : 'development' ),
					GJ_BUILD_TYPE: JSON.stringify( config.production ? 'production' : 'development' ),
					GJ_IS_CLIENT: JSON.stringify( false ),
					GJ_IS_ANGULAR: JSON.stringify( config.framework === 'angular' ),
					GJ_IS_VUE: JSON.stringify( config.framework === 'vue' ),

					// This sets vue in production mode.
					'process.env': {
						NODE_ENV: JSON.stringify( config.production ? 'production' : 'development' ),
					},
				}),
				new webpack.LoaderOptionsPlugin({
					options: {
						// Fix extract-loader: https://github.com/peerigon/extract-loader/issues/16
						output: {},
						htmlLoader: {
							minimize: config.production,

							// Fix angular templates.
							removeAttributeQuotes: false,
							ignoreCustomFragments: [ /\{\{.*?}}/ ],
						},
						stylus: {
							preferPathResolver: 'webpack'
						},
						postcss: [
							autoprefixer(),
						],
					}
				}),
				devNoop || new webpack.optimize.UglifyJsPlugin({
					compress: {
						warnings: false,
						screw_ie8: true,
					}
				}),
				devNoop || new ImageminPlugin(),
				prodNoop || new webpack.HotModuleReplacementPlugin(),
				devNoop || new webpack.optimize.CommonsChunkPlugin( {
					name: 'vendor',
					filename: 'vendor.[hash:6].js',
					minChunks: function( module, count )
					{
						// Pull anything from node_modules or bower-lib into vendor.
						return module.resource
							&& /\.js$/.test( module.resource )
							&& (
								/node_modules/.test( module.resource )
								|| /bower\-lib/.test( module.resource )
							);
					}
				} ),
				devNoop || new webpack.optimize.CommonsChunkPlugin( {
					name: 'manifest',
					filename: 'manifest.[hash:6].js',
					chunks: [ 'vendor' ],
				} ),
				devNoop || new ExtractTextPlugin( '[name].[contenthash:6].css' ),
				devNoop || new OptimizeCssPlugin( {
					cssProcessor: {
						process: function( css )
						{
							return new Promise( function( resolve, reject )
							{
								var output = cleanCss.minify( css );
								if ( output.errors.length ) {
									reject( output.errors );
								}
								else {
									resolve( {
										css: output.styles,
									} );
								}
							} );
						}
					},
				} ),
				new HtmlWebpackPlugin( {
					filename: indexHtml,
					template: '!!html-loader?interpolate=require!src/' + indexHtml,
					favicon: path.resolve( base, 'src/app/img/favicon.png' ),
					inject: true,
					chunksSortMode: 'dependency',
				} ),
				prodNoop || new FriendlyErrorsWebpackPlugin(),
				config.write ? new WriteFilePlugin() : noop,
				config.analyze ? new BundleAnalyzerPlugin() : noop,
			]
		};

		gulp.task( 'compile:' + section, function( cb )
		{
			var compiler = webpack( webpackSectionConfigs[ section ] );
			compiler.run( function( err, stats )
			{
				if ( err ) {
					throw new gutil.PluginError( 'webpack:build', err );
				}

				gutil.log( '[webpack:build]', stats.toString( {
					chunks: false,
					colors: true
				} ) );

				cb();
			} );
		} );

		webpackSectionTasks.push( 'compile:' + section );
	} );

	gulp.task( 'watch', function( cb )
	{
		var compiler = webpack( webpackSectionConfigs[ config.buildSection ] );

		var server = new WebpackDevServer( compiler, {
			historyApiFallback: {
				rewrites: [
					{ from: /./, to: (config.buildSection === 'app' ? '/index.html' : '/' + config.buildSection + '.html') },
				],
			},
			quiet: true,
			hot: true,
			watchOptions: {
				aggregateTimeout: 300,
			}
		} );

		server.listen( config.port, 'localhost' );
	} );

	gulp.task( 'compile', gulp.series( webpackSectionTasks ) );
	gulp.task( 'default', gulp.series( 'clean:pre', 'translations:compile', 'compile' ) );
};
