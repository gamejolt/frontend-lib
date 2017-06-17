var gulp = require('gulp');
var gutil = require('gulp-util');
var plugins = require('gulp-load-plugins')();

module.exports = function(config) {
	gulp.task('images:svg', function() {
		var src = config.sections.map(function(section) {
			return 'src/' + section + '/**/*.svg';
		});

		return gulp
			.src(src, { base: 'src' })
			.pipe(plugins.newer(config.buildDir))
			.pipe(config.production ? plugins.svgmin() : gutil.noop())
			.pipe(gulp.dest(config.buildDir))
			.pipe(plugins.connect.reload());
	});

	gulp.task('images:raster', function() {
		var src = config.sections.map(function(section) {
			return 'src/' + section + '/**/*.{bmp,png,jpg,jpeg,gif,ico}';
		});

		return gulp
			.src(src, { base: 'src' })
			.pipe(plugins.newer(config.buildDir))
			.pipe(
				config.production
					? plugins.imagemin({
							progressive: true,
							interlaced: true,
							pngquant: true,
						})
					: gutil.noop(),
			)
			.pipe(gulp.dest(config.buildDir))
			.pipe(plugins.connect.reload());
	});

	gulp.task('images:lib:svg', function() {
		return gulp
			.src([config.gjLibDir + 'components/**/*.svg'])
			.pipe(
				plugins.newer(
					config.buildDir +
						'/' +
						config.gjLibDir.replace('src/', '') +
						'components',
				),
			)
			.pipe(config.production ? plugins.svgmin() : gutil.noop())
			.pipe(
				gulp.dest(
					config.buildDir +
						'/' +
						config.gjLibDir.replace('src/', '') +
						'components',
				),
			)
			.pipe(plugins.connect.reload());
	});

	gulp.task('images:lib:raster', function() {
		return gulp
			.src([config.gjLibDir + 'components/**/*.{png,jpg,jpeg,gif}'])
			.pipe(
				plugins.newer(
					config.buildDir +
						'/' +
						config.gjLibDir.replace('src/', '') +
						'components',
				),
			)
			.pipe(
				config.production
					? plugins.imagemin({
							progressive: true,
							interlaced: true,
							pngquant: true,
						})
					: gutil.noop(),
			)
			.pipe(
				gulp.dest(
					config.buildDir +
						'/' +
						config.gjLibDir.replace('src/', '') +
						'components',
				),
			)
			.pipe(plugins.connect.reload());
	});

	gulp.task(
		'images',
		gulp.parallel(
			'images:svg',
			'images:raster',
			'images:lib:svg',
			'images:lib:raster',
		),
	);
};
