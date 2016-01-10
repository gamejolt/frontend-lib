(function( window ){

var MAX_EVENTS = 10;

var _numEvents = 0;

window.onerror = function( msg, url, line, col, error )
{
	// IE 6+
	if ( !col && window.event ) {
		col = window.event.errorCharacter;
	}

	sendError( {
		name: (error && error.name) || 'window.onerror',
		msg: msg,
		file: url,
		line: line,
		col: col,
		stack: (error && getStackFromError( error )) || generateStack(),
	} );
};

window.gjTrackError = function( error )
{
	sendError( {
		name: error.name,
		message: error.message || error.description,
		file: error.fileName || error.sourceURL,
		line: error.lineNumber || error.line,
		col: error.columnNumber ? error.columnNumber + 1 : undefined,
		stack: getStackFromError( error ) || generateStack(),
	} );
};

function getStackFromError( error )
{
	return error.stack || error.backtrace || error.stacktrace;
}

function generateStack()
{
	var stack = '';

	// Just generate an error to get a stacktrace.
	// This should work for most browsers.
	try {
		throw new Error( 'Generated error.' );
	}
	catch ( error ) {
		stack = getStackFromError( error );
	}

	return stack;
}

function sendError( errorInfo )
{
	++_numEvents;

	// Don't send if prerendering.
	if ( window.navigator.userAgent.search( /PhantomJS/ ) !== -1 ) {
		return;
	}

	// If too many errors, stop.
	if ( _numEvents > MAX_EVENTS ) {
		return;
	}

	var queryString = '';
	queryString += '?name=' + window.encodeURIComponent( errorInfo.name || '' );
	queryString += '&message=' + window.encodeURIComponent( errorInfo.message || '' );
	queryString += '&file=' + window.encodeURIComponent( errorInfo.file || '' );
	queryString += '&line=' + window.encodeURIComponent( errorInfo.line || '' );
	queryString += '&col=' + window.encodeURIComponent( errorInfo.col || '' );
	queryString += '&stack=' + window.encodeURIComponent( errorInfo.stack || '' );

	var img = window.document.createElement( 'img' );
	img.width = 1;
	img.height = 1;

	// We pull from the window location so that we don't load from CDN.
	// We separate the path so that we don't modify on production build.
	var filename = 'pixel.png';
	img.src = '//' + window.location.host + '/lib/gj-lib-client/components/error-tracking/' + filename + queryString;

	// In case we want to attach a callback in the future.
	img.onload = img.onerror = function()
	{
		img.onload = null;
		img.onerror = null;
	};
}

})( window );
