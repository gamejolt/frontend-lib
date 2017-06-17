var gulp = require('gulp');
var gutil = require('gulp-util');
var plugins = require('gulp-load-plugins')();

module.exports = function(config) {
	gulp.task('fonts', function() {
		var src = [];
		src.push(config.gjLibDir + 'components/**/*.{eot,ttf,woff,woff2}');
		src.push('src/app/**/*.{eot,ttf,woff,woff2}');

		// Only copy what has changed since last time.
		return gulp
			.src(src, { base: 'src' })
			.pipe(plugins.newer(config.buildDir))
			.pipe(gulp.dest(config.buildDir))
			.pipe(plugins.connect.reload());
	});
};
