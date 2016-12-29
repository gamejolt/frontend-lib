var _ = require( 'lodash' );
var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var plugins = require( 'gulp-load-plugins' )();
var streamqueue = require( 'streamqueue' );
var mergeStream = require( 'merge-stream' );
var fs = require( 'fs' );
var path = require( 'path' );

var rollupTypescript = require( 'rollup-plugin-typescript' );
var rollupResolve = require( 'rollup-plugin-node-resolve' );
var rollupString = require( 'rollup-plugin-string' );
var rollupReplace = require( 'rollup-plugin-replace' );
var rollupCommonJs = require( 'rollup-plugin-commonjs' );

const webpack = require( 'webpack' );

module.exports = function( config )
{
	var baseDir = '../../../../../';

	// Deprecated options.
	if ( config.extraBower || config.excludeBower ) {
		throw new Error( 'Bower functionality is removed! Include through TS import.' );
	}

	if ( config.extraLib ) {
		throw new Error( 'Extra lib is removed! Include through TS import.' );
	}

	var rollupOptions = {
		rollup: require( 'rollup' ),
		sourceMap: false,
		format: 'iife',
		plugins: [
			rollupReplace( {
				values: {
					GJ_ENVIRONMENT: JSON.stringify( !config.developmentEnv ? 'production' : 'development' ),
					GJ_BUILD_TYPE: JSON.stringify( config.production ? 'production' : 'development' ),
				},
			} ),
			{
				// import template from 'html!./something.html';
				transform: function( code, id )
				{
					return code.replace( 'html!', '' );
				},
			},
			rollupString( {
				include: '**/*.html',
			} ),
			{
				// Gotta convert `import something = require( 'something' )` into const something = require( 'something' )
				// TS with no module target strips it out if we don't change.
				transform: function( code, id )
				{
					return code.replace( /import ([^ ]+).*?=.*?require/g, 'const $1 = require' );
				}
			},
			rollupTypescript( {
				typescript: require( 'typescript' ),
			} ),
			rollupResolve( {
				module: true,
				jsnext: true,
				main: true,
			} ),
			rollupCommonJs( {
				include: [
					'node_modules/rxjs/**',
					'node_modules/core-js/**',
					'node_modules/ua-parser-js/**',
				],
			} ),
		],
	};

	var webpackOptions = require( '../config/webpack.common' );

	gulp.task( 'js:webpack', function( cb )
	{
		webpack( webpackOptions( config ), ( err, stats ) =>
		{
			if ( err ) {
				console.error( err.stack || err );
				if ( err.details ) {
					console.error( err.details );
				}
				return;
			}

			const info = stats.toJson();

			if ( stats.hasErrors() ) {
				console.error( info.errors );
			}

			if ( stats.hasWarnings() ) {
				console.warn( info.warnings );
			}

			cb();
		} );
	} );

	gulp.task( 'js:polyfill', function( cb )
	{
		if ( !config.rollup || !config.rollup.vendor || config.watching == 'watching' ) {
			cb();
			return;
		}

		var _rollupOptions = Object.assign( {}, rollupOptions );

		return gulp.src( 'src/polyfill.ts', { read: false, base: 'src' } )
			// .pipe( config.noSourcemaps ? gutil.noop() : plugins.sourcemaps.init() )
			.pipe( plugins.rollup( _rollupOptions ) )
			.pipe( plugins.rename( 'polyfill.js' ) )
			.pipe( config.production ? plugins.uglify() : gutil.noop() )
			// .pipe( config.noSourcemaps ? gutil.noop() : plugins.sourcemaps.write( '.', {
			// 	sourceRoot: '/../../src/app/',
			// } ) )
			.pipe( plugins.size( { gzip: true, title: 'js:polyfill' } ) )
			.pipe( gulp.dest( config.buildDir ) )
			;
	} );

	/**
	 * Build out the vendor JS.
	 */
	gulp.task( 'js:vendor', function( cb )
	{
		if ( !config.rollup || !config.rollup.vendor || config.watching == 'watching' ) {
			cb();
			return;
		}

		var _rollupOptions = Object.assign( {}, rollupOptions, {
			moduleName: 'vendor',
		} );

		return gulp.src( 'src/vendor.ts', { read: false, base: 'src' } )
			// .pipe( config.noSourcemaps ? gutil.noop() : plugins.sourcemaps.init() )
			.pipe( plugins.rollup( _rollupOptions ) )
			.pipe( plugins.rename( 'vendor.js' ) )
			.pipe( config.production ? plugins.uglify() : gutil.noop() )
			// .pipe( config.noSourcemaps ? gutil.noop() : plugins.sourcemaps.write( '.', {
			// 	sourceRoot: '/../../src/app/',
			// } ) )
			.pipe( plugins.size( { gzip: true, title: 'js:vendor' } ) )
			.pipe( gulp.dest( config.buildDir ) )
			;
	} );

	// gulp.task( 'js:vendor', function( cb )
	// {
	// 	if ( config.watching == 'watching' ) {
	// 		cb();
	// 		return;
	// 	}

	// 	var files = [
	// 		config.buildDir + '/tmp/rollup/vendor.js',
	// 	];

	// 	// Do we also have extra lib files to include?
	// 	if ( config.extraLib ) {
	// 		_.forEach( config.extraLib, function( extraFiles, repo )
	// 		{
	// 			if ( _.isString( extraFiles ) ) {
	// 				extraFiles = [ extraFiles ];
	// 			}

	// 			if ( _.isArray( extraFiles ) ) {
	// 				_.forEach( extraFiles, function( extraFile )
	// 				{
	// 					files.push( config.libDir + repo + '/' + extraFile );
	// 				} );
	// 			}
	// 		} );
	// 	}

	// 	// Include the compiled vendor component templates.
	// 	files.push( config.buildDir + '/tmp/vendor-component-templates/**/*.js' );

	// 	gutil.log( 'Adding files to vendor: ' + gutil.colors.gray( JSON.stringify( files ) ) );

	// 	if ( files.length ) {
	// 		return gulp.src( files )
	// 			.pipe( config.noSourcemaps ? gutil.noop() : plugins.sourcemaps.init() )
	// 			.pipe( plugins.concat( 'vendor.js' ) )
	// 			.pipe( config.production ? plugins.uglify() : gutil.noop() )
	// 			.pipe( config.noSourcemaps ? gutil.noop() : plugins.sourcemaps.write( '.', {
	// 				sourceRoot: '/../../src/app/',
	// 			} ) )
	// 			.pipe( plugins.size( { gzip: true, title: 'js:vendor' } ) )
	// 			.pipe( gulp.dest( config.buildDir + '/app' ) )
	// 			;
	// 	}
	// } );

	/**
	 * Build out the section components.
	 */
	var sectionTasks = [];
	config.sections.forEach( function( section )
	{
		sectionTasks.push( 'js:' + section );

		gulp.task( 'js:' + section, function( cb )
		{
			if ( config.buildSection && config.buildSection != section && config.watching == 'watching' ) {
				cb();
				return;
			}

			var _rollupOptions = Object.assign( {}, rollupOptions );

			if ( config.rollup && config.rollup.vendor ) {
				Object.assign( _rollupOptions, {
					external: Object.keys( config.rollup.vendor ),
					globals: config.rollup.vendor,
				} );
			}

			var stream = gulp.src( 'src/' + section + '/main.ts', { read: false, base: 'src' } )
				// .pipe( config.noSourcemaps ? gutil.noop() : plugins.sourcemaps.init() )
				.pipe( plugins.rollup( _rollupOptions ) )
				.pipe( plugins.rename( 'app.js' ) )
				;

			// Add in any injections here that may be configured.
			// They should go in before further processing.
			if ( config.injections ) {
				for ( var key in config.injections ) {
					stream = stream.pipe( plugins.replace( key, config.injections[ key ] ) );
				}
			}

			stream = stream
				.pipe( config.production ? plugins.uglify() : gutil.noop() )
				// .pipe( config.noSourcemaps ? gutil.noop() : plugins.sourcemaps.write( '.', {
				// 	sourceRoot: '/../../src/' + section + '/',
				// } ) )
				.pipe( plugins.size( { gzip: true, title: 'js:' + section } ) )
				.pipe( gulp.dest( config.buildDir + '/' + section ) )
				;

			return stream;
		} );

		// gulp.task( 'js:' + section, gulp.series( gulp.parallel( 'ts:' + section ), function( cb )
		// {
		// 	if ( config.buildSection && config.buildSection != section && config.watching == 'watching' ) {
		// 		cb();
		// 		return;
		// 	}

		// 	// We don't include any app files that are being built into a separate module.
		// 	var excludeApp = [];
		// 	if ( config.modules ) {
		// 		_.forEach( config.modules, function( moduleDefinition )
		// 		{
		// 			if ( moduleDefinition.components ) {
		// 				moduleDefinition.components.forEach( function( component )
		// 				{
		// 					excludeApp.push( '!src/' + section + '/components/' + component + '/**/*.js' );
		// 				} );
		// 			}

		// 			// We pull in the state definitions, but exclude any controllers, directives, etc.
		// 			if ( moduleDefinition.views ) {
		// 				moduleDefinition.views.forEach( function( view )
		// 				{
		// 					excludeApp.push( '!src/' + section + '/views/' + view + '/**/*-{service,controller,directive,filter,model}.js' );
		// 				} );
		// 			}

		// 			if ( moduleDefinition.lib ) {
		// 				_.forEach( moduleDefinition.lib, function( extraFiles, repo )
		// 				{
		// 					if ( _.isString( extraFiles ) ) {
		// 						extraFiles = [ extraFiles ];
		// 					}

		// 					if ( _.isArray( extraFiles ) ) {
		// 						_.forEach( extraFiles, function( extraFile )
		// 						{
		// 							excludeApp.push( '!' + config.libDir + repo + '/' + extraFile );
		// 						} );
		// 					}
		// 				} );
		// 			}
		// 		} );
		// 	}

		// 	var stream = new streamqueue( { objectMode: true } );

		// 	// Gotta pull in TS/rollup file as the first thing.
		// 	stream.queue( gulp.src( [ config.buildDir + '/tmp/rollup/' + section + '.js' ], { base: 'src', allowEmpty: true } ) );

		// 	// Pull in modules definitions only before actual components..
		// 	stream.queue( gulp.src( _.union( [
		// 		'src/' + section + '/**/*.js',
		// 		'!src/' + section + '/**/*-{service,controller,directive,filter,model,production,development,node}.js'
		// 	], excludeApp ), { base: 'src' } ) );

		// 	// Then pull in the actual components.
		// 	stream.queue( gulp.src( _.union( [
		// 		'src/' + section + '/**/*-{service,controller,directive,filter,model}.js'
		// 	], excludeApp ), { base: 'src' } ) );

		// 	// Pull in template partials if there are any.
		// 	stream.queue( gulp.src( [ config.buildDir + '/tmp/' + section + '-partials/**/*.html.js' ], { base: 'src' } ) );

		// 	var stream = stream.done()
		// 		.pipe( config.noSourcemaps ? gutil.noop() : plugins.sourcemaps.init() )
		// 		.pipe( plugins.concat( 'app.js' ) );

		// 	// Add in any injections here that may be configured.
		// 	// They should go in before further processing.
		// 	if ( config.injections ) {
		// 		for ( var key in config.injections ) {
		// 			stream = stream.pipe( plugins.replace( key, config.injections[ key ] ) );
		// 		}
		// 	}

		// 	stream = stream
		// 		.pipe( config.production ? plugins.uglify() : gutil.noop() )
		// 		.pipe( config.noSourcemaps ? gutil.noop() : plugins.sourcemaps.write( '.', {
		// 			sourceRoot: '/../../src/' + section + '/',
		// 		} ) )
		// 		.pipe( plugins.size( { gzip: true, title: 'js:' + section } ) )
		// 		.pipe( gulp.dest( config.buildDir + '/' + section ) )
		// 		;

		// 	return stream;
		// } ) );
	} );

	gulp.task( 'js:sections', gulp.parallel( sectionTasks ) );

	/**
	 * Build out the modules.
	 */
	var moduleBuilds = [];
	// if ( config.modules ) {

	// 	// We loop through all of the modules we need to build and set up gulp tasks to build them.
	// 	_.forEach( config.modules, function( moduleDefinition, outputFilename )
	// 	{
	// 		gulp.task( 'ts:module:' + outputFilename, function( cb )
	// 		{
	// 			if ( config.buildModule && config.buildModule != outputFilename && config.watching == 'watching' ) {
	// 				cb();
	// 				return;
	// 			}

	// 			if ( !moduleDefinition.main ) {
	// 				cb();
	// 				return;
	// 			}

	// 			var vendorIds = Object.keys( config.rollup.vendor );
	// 			var _rollupOptions = Object.assign( {}, rollupOptions, {
	// 				external: function( id )
	// 				{
	// 					var i;

	// 					if ( vendorIds.indexOf( id ) !== -1 ) {
	// 						return true;
	// 					}

	// 					if ( id[0] == '.' || id == 'typescript-helpers' ) {
	// 						return false;
	// 					}

	// 					if ( id.search( /node_modules/i ) !== -1 ) {
	// 						return false;
	// 					}

	// 					if ( moduleDefinition.components ) {
	// 						for ( i in moduleDefinition.components ) {
	// 							if ( id.search( new RegExp( 'src\/app\/components\/' + moduleDefinition.components[ i ] + '\/.*' ) ) !== -1 ) {
	// 								return false;
	// 							}
	// 						}
	// 					}

	// 					if ( moduleDefinition.views ) {
	// 						for ( i in moduleDefinition.views ) {
	// 							if ( id.search( new RegExp( 'src\/app\/views\/' + moduleDefinition.views[ i ] + '\/.*' ) ) !== -1 ) {
	// 								return false;
	// 							}
	// 						}
	// 					}

	// 					return true;
	// 				},
	// 				globals: config.rollup.vendor,
	// 			} );

	// 			var rollupStream = gulp.src( 'src/app' + moduleDefinition.main, { read: false, base: 'src' } )
	// 				.pipe( plugins.rollup( _rollupOptions ) );

	// 			return gulp.src( 'src/app' + moduleDefinition.main, { read: false, base: 'src' } )
	// 				.pipe( plugins.rollup( _rollupOptions ) )
	// 				.pipe( plugins.rename( outputFilename ) )
	// 				.pipe( gulp.dest( config.buildDir + '/tmp/rollup' ) )
	// 				;
	// 		} );

	// 		// Create the gulp task to build this module.
	// 		gulp.task( 'js:module:' + outputFilename, gulp.series( 'ts:module:' + outputFilename, function( cb )
	// 		{
	// 			if ( config.buildModule && config.buildModule != outputFilename && config.watching == 'watching' ) {
	// 				cb();
	// 				return;
	// 			}

	// 			if ( moduleDefinition.bower ) {
	// 				throw new Error( 'Bower is deprecated! Include through TS import.' );
	// 			}

	// 			if ( moduleDefinition.lib ) {
	// 				_.forEach( moduleDefinition.lib, function( extraFiles, repo )
	// 				{
	// 					if ( _.isString( extraFiles ) ) {
	// 						extraFiles = [ extraFiles ];
	// 					}

	// 					if ( _.isArray( extraFiles ) ) {
	// 						_.forEach( extraFiles, function( extraFile )
	// 						{
	// 							files.push( config.libDir + repo + '/' + extraFile );
	// 						} );
	// 					}
	// 				} );
	// 			}

	// 			if ( moduleDefinition.componentVendor ) {
	// 				_.forEach( moduleDefinition.componentVendor, function( component )
	// 				{
	// 					files.push( config.gjLibDir + 'components/' + component + '/*-vendor.js' );
	// 				} );
	// 			}

	// 			gutil.log( 'Build module ' + outputFilename + ' with files: ' + gutil.colors.gray( JSON.stringify( files ) ) );

	// 			var stream = new streamqueue( { objectMode: true } );

	// 			// Gotta pull in TS/rollup file as the first thing.
	// 			stream.queue( gulp.src( [ config.buildDir + '/tmp/rollup/' + outputFilename ], { base: 'src', allowEmpty: true } ) );

	// 			if ( files.length ) {
	// 				stream.queue( gulp.src( files, { base: 'src' } ) );
	// 			}

	// 			// Component files?
	// 			if ( moduleDefinition.components ) {
	// 				moduleDefinition.components.forEach( function( component )
	// 				{
	// 					// Pull in modules definitions only first.
	// 					stream.queue( gulp.src( [
	// 						'src/app/components/' + component + '/**/*.js',
	// 						'!src/app/components/' + component + '/**/*-{service,controller,directive,filter,model,production,development,node}.js',
	// 					], { base: 'src' } ) );

	// 					// Then pull in the actual components.
	// 					stream.queue( gulp.src( [
	// 						'src/app/components/' + component + '/**/*-{service,controller,directive,filter,model}.js',
	// 					], { base: 'src' } ) );
	// 				} );
	// 			}

	// 			// Views files?
	// 			if ( moduleDefinition.views ) {
	// 				moduleDefinition.views.forEach( function( view )
	// 				{
	// 					// We don't pull in state or module definitions (files without a suffx).
	// 					// This way the states will all be available for routing, but controllers and what not
	// 					// can be lazy loaded in.
	// 					stream.queue( gulp.src( [
	// 						'src/app/views/' + view + '/**/*-{service,controller,directive,filter,model}.js',
	// 					], { base: 'src' } ) );
	// 				} );
	// 			}

	// 			// Call it with the arguments we've built up.
	// 			stream = stream.done()
	// 				.pipe( config.noSourcemaps ? gutil.noop() : plugins.sourcemaps.init() )
	// 				.pipe( plugins.concat( outputFilename ) )
	// 				.pipe( config.production ? plugins.uglify() : gutil.noop() )
	// 				.pipe( config.noSourcemaps ? gutil.noop() : plugins.sourcemaps.write( '.', {
	// 					sourceRoot: '/../../src/app/modules/',
	// 				} ) )
	// 				.pipe( plugins.size( { gzip: true, title: 'js:module:' + outputFilename } ) )
	// 				.pipe( gulp.dest( config.buildDir + '/app/modules' ) )
	// 				;

	// 			return stream;
	// 		} ) );

	// 		// Now store this module build task reference.
	// 		moduleBuilds.push( 'js:module:' + outputFilename );
	// 	} );
	// }

	if ( moduleBuilds.length ) {
		gulp.task( 'js:modules', gulp.parallel( moduleBuilds ) );
	}
	else {
		gulp.task( 'js:modules', ( cb ) => cb() );
	}

	/**
	 * Copy any node app components.
	 */
	gulp.task( 'js:node:app', function( cb )
	{
		// Only if we are including node files.
		if ( !config.includeNode ) {
			cb();
			return;
		}

		var src = config.sections.map( function( section )
		{
			return 'src/' + section + '/**/*-node.js';
		} );

		return gulp.src( src, { base: 'src' } )
			.pipe( gulp.dest( config.buildDir ) );
	} );

	// gulp.task( 'js', gulp.parallel( 'js:vendor', 'js:sections', 'js:modules', 'js:node:app' ) );
	gulp.task( 'js', gulp.parallel( 'js:polyfill', 'js:vendor', 'js:sections' ) );
	// gulp.task( 'js', gulp.parallel( 'js:webpack' ) );
};
