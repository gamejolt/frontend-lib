var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var globExpand = require('glob-expand');
var fs = require('fs');
var _ = require('lodash');

const PLUGIN_NAME = 'gulp-lazy-states.js';

function findUrl(content) {
	// Only search within a chunk of 100 characters.
	// TODO: Make this better/smarter somehow?
	content = content.substr(0, 100);

	var matches = content.match(/url:[ ]?['"](.+)['"]/);
	if (matches) {
		return matches[1];
	}

	return null;
}

module.exports = function(options) {
	var cwd = process.cwd();

	// Creating a stream through which each file will pass
	var stream = through.obj(function(file, enc, callback) {
		var output = [];

		if (file.isBuffer()) {
			var content = file.contents.toString();

			do {
				var matches = content.match(
					/\$stateProvider\.state\([ ]?['"]([a-zA-Z0-9\.\-_]+)['"]/,
				);

				if (!matches) {
					break;
				}

				var curItem = {
					name: matches[1],
				};

				var currentIndex = matches.index + matches[0].length;
				content = content.substr(currentIndex);

				var url = findUrl(content);
				if (url) {
					curItem.url = url;
				}

				output.push(curItem);
			} while (content);

			if (output.length) {
				fs.writeFileSync(
					cwd + '/' + options.outputFile,
					JSON.stringify(output),
				);
			}
		} else if (file.isStream()) {
			// Streams not supported.
			this.emit(
				'error',
				new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported.'),
			);
			return callback();
		}

		// Anything else just falls through.
		this.push(file);
		return callback();
	});

	// returning the file stream
	return stream;
};
