var gulp = require( 'gulp' );
var path = require( 'path' );

var webpack = require( 'webpack' );
var HtmlWebpackPlugin = require( 'html-webpack-plugin' );
var FriendlyErrorsWebpackPlugin = require( 'friendly-errors-webpack-plugin' );
var ScriptExtHtmlWebpackPlugin = require( 'script-ext-html-webpack-plugin' );
var ExtractTextPlugin = require( 'extract-text-webpack-plugin' );
var WebpackDevServer = require( 'webpack-dev-server' );
var OptimizeCssPlugin = require( 'optimize-css-assets-webpack-plugin' );
var ImageminPlugin = require( 'imagemin-webpack-plugin' ).default;
var DashboardPlugin = require( 'webpack-dashboard/plugin' );

var CleanCss = require( 'clean-css' );

module.exports = function( config )
{
	var base = path.resolve( __dirname, '..' );

	var devNoop = config.production ? undefined : function(){};
	var prodNoop = !config.production ? undefined : function(){};

	var externals = {};
	for ( var extern of [ 'nw.gui', 'client-voodoo', 'path', 'os', 'fs' ] ) {
		externals[ extern ] = { commonjs: extern };
	}

	var section = 'app';
	var indexHtml = section === 'app' ? 'index.html' : section + '.html';

	var cleanCss = new CleanCss( {
		level: 2,
	} );

	function stylesLoader( loader )
	{
		if ( config.production ) {
			return ExtractTextPlugin.extract( loader );
		}
		return 'style-loader!' + loader;
	}

	var appEntries = [
		path.resolve( base, 'src/' + section + '/main.ts' ),
	];

	if ( !config.production ) {
		appEntries.push( 'webpack-dev-server/client?http://localhost:8080/' );
		appEntries.push( 'webpack/hot/dev-server' );
	}

	var webpackOptions = {
		entry: {
			app: appEntries,
		},
		output: {
			publicPath: '/',
			path: path.resolve( base, config.buildDir ),
			filename: config.production ? section + '.[chunkhash:6].js' : section + '.js',
			chunkFilename: config.production ? section + '.[id].[chunkhash:6].js' : undefined,
		},
		resolve: {
			extensions: [ '.tsx', '.ts', '.js' ],
			alias: {
				'img': path.resolve( base, 'src/' + section + '/img' ),
			}
		},
		externals: externals,
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: [
						{
							// God save us.
							loader: 'string-replace-loader',
							options: {
								search: '$import(',
								replace: 'import('
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
								search: '$import(',
								replace: 'import('
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
				{
					test: /\.html$/,
					use: [
						'file-loader?name=templates/[name].[hash:6].[ext]',
						'extract-loader',
						'html-loader',
					],
				},
				{
					test: /\.styl$/,
					loader: stylesLoader( 'css-loader!stylus-loader?paths[]=src/&resolve url&include css' ),
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
				GJ_IS_ANGULAR: JSON.stringify( true ),
				GJ_IS_VUE: JSON.stringify( false ),
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
						default: {
							preferPathResolver: 'webpack'
						},
					},
				}
			}),
			devNoop || new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: false,
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
				// necessary to consistently work with multiple chunks via CommonsChunkPlugin
				chunksSortMode: 'dependency'
			} ),
			// prodNoop || new FriendlyErrorsWebpackPlugin(),
			// devNoop || new ScriptExtHtmlWebpackPlugin({
			// 	sync: [ 'manifest' ],
			// 	defaultAttribute: 'async',
			// }),
			prodNoop || new DashboardPlugin(),
		]
	};

	gulp.task( 'watch', function( cb )
	{
		var compiler = webpack( webpackOptions );

		var server = new WebpackDevServer( compiler, {
			historyApiFallback: true,
			// quiet: true,
			hot: true,
			watchOptions: {
				aggregateTimeout: 300,
			}
		} );

		server.listen( 8080, 'localhost' );
	} );

	gulp.task( 'compile', function( cb )
	{
		var compiler = webpack( webpackOptions );
		compiler.run( cb );
	} );

	gulp.task( 'default', gulp.series( 'clean:pre', 'compile' ) );
};
