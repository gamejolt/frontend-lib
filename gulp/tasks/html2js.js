var _ = require( 'lodash' );
var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var plugins = require( 'gulp-load-plugins' )();

module.exports = function( config )
{
	/**
	 * Vendor template files that need to be compiled.
	 */
	gulp.task( 'html2js:datepicker', function()
	{
		return gulp.src( config.gjLibDir + 'components/datepicker/**/*.html' )
			.pipe( plugins.newer( {
				dest: config.buildDir + '/tmp/vendor-component-templates',
				ext: '.html.js'
			} ) )
			.pipe( plugins.ngHtml2js( {
				moduleName: 'ui.bootstrap.datepicker.tpls',
				stripPrefix: config.gjLibDir + 'components/',
				prefix: 'template/datepicker/'
			} ) )
			.pipe( plugins.rename( { extname: '.html.js' } ) )
			.pipe( gulp.dest( config.buildDir + '/tmp/vendor-component-templates/' ) );
	} );

	gulp.task( 'html2js:timepicker', function()
	{
		return gulp.src( config.gjLibDir + 'components/timepicker/**/*.html' )
			.pipe( plugins.newer( {
				dest: config.buildDir + '/tmp/vendor-component-templates',
				ext: '.html.js'
			} ) )
			.pipe( plugins.ngHtml2js( {
				moduleName: 'ui.bootstrap.timepicker.tpls',
				stripPrefix: config.gjLibDir + 'components/',
				prefix: 'template/timepicker/'
			} ) )
			.pipe( plugins.rename( { extname: '.html.js' } ) )
			.pipe( gulp.dest( config.buildDir + '/tmp/vendor-component-templates/' ) );
	} );

	gulp.task( 'html2js:tooltip', function()
	{
		return gulp.src( config.gjLibDir + 'components/tooltip/**/*.html' )
			.pipe( plugins.newer( {
				dest: config.buildDir + '/tmp/vendor-component-templates',
				ext: '.html.js'
			} ) )
			.pipe( plugins.ngHtml2js( {
				moduleName: 'ui.bootstrap.tooltip.tpls',
				stripPrefix: config.gjLibDir + 'components/',
				prefix: 'template/tooltip/'
			} ) )
			.pipe( plugins.rename( { extname: '.html.js' } ) )
			.pipe( gulp.dest( config.buildDir + '/tmp/vendor-component-templates/' ) );
	} );

	gulp.task( 'html2js:pagination', function()
	{
		return gulp.src( config.gjLibDir + 'components/pagination/{pagination,pager}.html' )
			.pipe( plugins.newer( {
				dest: config.buildDir + '/tmp/vendor-component-templates',
				ext: '.html.js'
			} ) )
			.pipe( plugins.ngHtml2js( {
				moduleName: 'ui.bootstrap.pagination',
				stripPrefix: config.gjLibDir + 'components/',
				prefix: 'template/pagination/'
			} ) )
			.pipe( plugins.rename( { extname: '.html.js' } ) )
			.pipe( gulp.dest( config.buildDir + '/tmp/vendor-component-templates/' ) );
	} );

	gulp.task( 'html2js:modal', function()
	{
		return gulp.src( config.gjLibDir + 'components/modal/**/*.html' )
			.pipe( plugins.newer( {
				dest: config.buildDir + '/tmp/vendor-component-templates',
				ext: '.html.js'
			} ) )
			.pipe( plugins.ngHtml2js( {
				moduleName: 'ui.bootstrap.modal',
				stripPrefix: config.gjLibDir + 'components/',
				prefix: 'template/modal/'
			} ) )
			.pipe( plugins.rename( { extname: '.html.js' } ) )
			.pipe( gulp.dest( config.buildDir + '/tmp/vendor-component-templates/' ) );
	} );

	/**
	 * Compile section component template files.
	 */
	config.sections.forEach( function( section )
	{
		gulp.task( 'html2js:' + section + ':components', function()
		{
			// We don't include any section folders that are being built into a separate module.
			var excludeApp = [];
			if ( config.modules ) {
				_.forEach( config.modules, function( moduleDefinition )
				{
					if ( moduleDefinition.components ) {
						moduleDefinition.components.forEach( function( component )
						{
							excludeApp.push( '!src/' + section + '/components/' + component + '/**/*.html' );
						} );
					}
				} );
			}

			return gulp.src( _.union( [
					'src/' + section + '/components/**/*.html',

					// No form templates.
					'!src/' + section + '/components/forms/**/*.html',

					// Include partials.
					'src/' + section + '/views/**/_*.html',

				], excludeApp ), { base: 'src' } )
				.pipe( plugins.ngHtml2js( {
					moduleName: 'App',
					prefix: '/',
				} ) )
				.pipe( plugins.rename( { extname: '.html.js' } ) )
				.pipe( gulp.dest( config.buildDir + '/tmp/' + section + '-component-templates/' ) );
		} );
	} );

	/**
	 * Compile module template files.
	 */
	var moduleBuilds = [];
	if ( config.modules ) {

		// We loop through all of the extra modules we need to build and set up gulp tasks to build them.
		_.forEach( config.modules, function( moduleDefinition, outputFilename )
		{
			// Skip if we don't have a component or module.
			if ( !moduleDefinition.components || !moduleDefinition.module ) {
				return;
			}

			// Gotta build all components in the module separately.
			moduleDefinition.components.forEach( function( component )
			{
				var taskName = 'html2js:module:' + outputFilename + ':' + component;
				moduleBuilds.push( taskName );

				gulp.task( taskName, function()
				{
					return gulp.src( [ 'src/app/components/' + component + '/**/*.html' ] )
						.pipe( plugins.ngHtml2js( {
							moduleName: moduleDefinition.module,
							prefix: '/app/components/' + component + '/'
						} ) )
						.pipe( plugins.rename( { extname: '.html.js' } ) )
						.pipe( gulp.dest( config.buildDir + '/tmp/module-templates/' + component ) );
				} );
			} );
		} );
	}

	gulp.task( 'html2js:modules', moduleBuilds );
};
