var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var globExpand = require('glob-expand');
var fs = require('fs');
var _ = require('lodash');
var Concat = require('concat-with-sourcemaps');
var path = require('path');

const PLUGIN_NAME = 'gulp-inject-modules.js';

// TODO: Make this async.
function gatherModules(config) {
	var cwd = process.cwd();

	// Creating a stream through which each file will pass
	var stream = through.obj(function(file, enc, callback) {
		if (file.isBuffer()) {
			var modules = [];

			// Matches 'gj.User' and "gj.User"
			// The +? will do a greedy match.
			modules = file.contents
				.toString()
				.match(/['"]gj\.([a-zA-Z0-9\.]+?)['"]/g);

			// Convert each match to a filename format.
			modules = _.map(modules, function(module) {
				return module
					.replace(/['"]/g, '') // Replace quotes.
					.replace(/gj\./, '') // Replace the gj. part.
					.replace(/\./g, '/') // Convert any other . to /.
					.replace(/([a-z])([A-Z])/g, '$1-$2') // Converts CamelCase to camel-case.
					.toLowerCase(); // Lowercase it.
			});

			// Make sure the list is unique so we only include files once.
			modules = _.uniq(modules);

			gutil.log(
				'Injecting client lib modules: ' +
					gutil.colors.gray(JSON.stringify(modules)),
			);

			if (modules.length) {
				var concat = new Concat(
					!!file.sourceMap,
					path.basename(file.path),
					gutil.linefeed,
				);
				concat.add(
					path.relative(cwd, file.path),
					file.contents,
					file.sourceMap,
				);

				// Loop through each matched module.
				modules.forEach(function(module) {
					// We glob it out so that module definitions load in first.
					var files = globExpand({ cwd: cwd }, [
						config.gjLibDir + 'components/' + module + '/*.js',
						'!' +
							config.gjLibDir +
							'components/' +
							module +
							'/*-{service,controller,directive,filter,model,vendor}.js',
						config.gjLibDir +
							'components/' +
							module +
							'/*-{service,controller,directive,filter,model}.js',
					]);

					files.forEach(function(_file) {
						concat.add(_file, fs.readFileSync(cwd + '/' + _file));
					});
				});

				file.contents = concat.content;

				if (concat.sourceMapping) {
					file.sourceMap = JSON.parse(concat.sourceMap);
				}
			}
		} else if (file.isStream()) {
			// Streams not supported.
			this.emit(
				'error',
				new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported.'),
			);
			return callback();
		}

		this.push(file);
		return callback();
	});

	// returning the file stream
	return stream;
}

module.exports = gatherModules;
