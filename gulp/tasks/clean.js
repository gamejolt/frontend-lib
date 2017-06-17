var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

module.exports = function(config) {
	// Clean out the whole build directory pre-build.
	gulp.task('clean:pre', function() {
		return gulp
			.src(config.buildDir, { read: false, allowEmpty: true })
			.pipe(plugins.clean({ force: true }));
	});

	// Clean out the tmp direction post build.
	gulp.task('clean:post', function() {
		return gulp
			.src(config.buildDir + '/tmp', { read: false, allowEmpty: true })
			.pipe(plugins.clean({ force: true }));
	});
};
