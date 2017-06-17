var _ = require('lodash');
var gulp = require('gulp');
var gutil = require('gulp-util');
var plugins = require('gulp-load-plugins')();

module.exports = function(config) {
	/**
	 * Vendor template files that need to be compiled.
	 */
	gulp.task('html2js:datepicker', function(cb) {
		if (config.watching == 'watching') {
			cb();
			return;
		}

		return gulp
			.src(config.gjLibDir + 'components/datepicker/**/*.html')
			.pipe(
				plugins.newer({
					dest: config.buildDir + '/tmp/vendor-component-templates',
					ext: '.html.js',
				}),
			)
			.pipe(
				plugins.ngHtml2js({
					moduleName: 'ui.bootstrap.datepicker.tpls',
					stripPrefix: config.gjLibDir + 'components/',
					prefix: 'template/datepicker/',
				}),
			)
			.pipe(plugins.rename({ extname: '.html.js' }))
			.pipe(gulp.dest(config.buildDir + '/tmp/vendor-component-templates/'));
	});

	gulp.task('html2js:timepicker', function(cb) {
		if (config.watching == 'watching') {
			cb();
			return;
		}

		return gulp
			.src(config.gjLibDir + 'components/timepicker/**/*.html')
			.pipe(
				plugins.newer({
					dest: config.buildDir + '/tmp/vendor-component-templates',
					ext: '.html.js',
				}),
			)
			.pipe(
				plugins.ngHtml2js({
					moduleName: 'ui.bootstrap.timepicker.tpls',
					stripPrefix: config.gjLibDir + 'components/',
					prefix: 'template/timepicker/',
				}),
			)
			.pipe(plugins.rename({ extname: '.html.js' }))
			.pipe(gulp.dest(config.buildDir + '/tmp/vendor-component-templates/'));
	});

	gulp.task('html2js:tooltip', function(cb) {
		if (config.watching == 'watching') {
			cb();
			return;
		}

		return gulp
			.src(config.gjLibDir + 'components/tooltip/**/*.html')
			.pipe(
				plugins.newer({
					dest: config.buildDir + '/tmp/vendor-component-templates',
					ext: '.html.js',
				}),
			)
			.pipe(
				plugins.ngHtml2js({
					moduleName: 'ui.bootstrap.tooltip.tpls',
					stripPrefix: config.gjLibDir + 'components/',
					prefix: 'template/tooltip/',
				}),
			)
			.pipe(plugins.rename({ extname: '.html.js' }))
			.pipe(gulp.dest(config.buildDir + '/tmp/vendor-component-templates/'));
	});

	gulp.task('html2js:pagination', function(cb) {
		if (config.watching == 'watching') {
			cb();
			return;
		}

		return gulp
			.src(config.gjLibDir + 'components/pagination/{pagination,pager}.html')
			.pipe(
				plugins.newer({
					dest: config.buildDir + '/tmp/vendor-component-templates',
					ext: '.html.js',
				}),
			)
			.pipe(
				plugins.ngHtml2js({
					moduleName: 'ui.bootstrap.pagination',
					stripPrefix: config.gjLibDir + 'components/',
					prefix: 'template/pagination/',
				}),
			)
			.pipe(plugins.rename({ extname: '.html.js' }))
			.pipe(gulp.dest(config.buildDir + '/tmp/vendor-component-templates/'));
	});

	gulp.task('html2js:modal', function(cb) {
		if (config.watching == 'watching') {
			cb();
			return;
		}

		return gulp
			.src(config.gjLibDir + 'components/modal/**/*.html')
			.pipe(
				plugins.newer({
					dest: config.buildDir + '/tmp/vendor-component-templates',
					ext: '.html.js',
				}),
			)
			.pipe(
				plugins.ngHtml2js({
					moduleName: 'ui.bootstrap.modal',
					stripPrefix: config.gjLibDir + 'components/',
					prefix: 'template/modal/',
				}),
			)
			.pipe(plugins.rename({ extname: '.html.js' }))
			.pipe(gulp.dest(config.buildDir + '/tmp/vendor-component-templates/'));
	});

	/**
	 * Compile section partials.
	 */
	config.sections.forEach(function(section) {
		gulp.task('html2js:' + section + ':partials', function(cb) {
			if (
				config.buildSection &&
				config.buildSection != section &&
				config.watching == 'watching'
			) {
				cb();
				return;
			}

			return gulp
				.src(['src/' + section + '/views/**/_*.html'], { base: 'src' })
				.pipe(
					plugins.ngHtml2js({
						moduleName: 'App',
						prefix: '/',
					}),
				)
				.pipe(plugins.rename({ extname: '.html.js' }))
				.pipe(gulp.dest(config.buildDir + '/tmp/' + section + '-partials/'));
		});
	});
};
