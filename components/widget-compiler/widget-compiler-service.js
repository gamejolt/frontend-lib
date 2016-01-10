angular.module( 'gj.WidgetCompiler' ).service( 'WidgetCompiler', function( $injector )
{
	var _this = this;
	var _widgets = [];

	var _regex = {

		// Match widget definitions: {% activity-feed %}
		// {%(whitespace character)(none new line character -- greedy match)(whitespace character)%}
		// Global match
		widget: /\{\%\s(.+?)\s\%\}/,

		// To match any whitespace.
		whitespace: /\s+/g,

		// Polyfill from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
		whitespaceTrim: /^\s+|\s+$/g
	};

	this.addWidget = function( widgetService )
	{
		_widgets[ widgetService.name ] = widgetService.compile;
	};

	// Add in default widgets.
	this.addWidget( $injector.get( 'WidgetCompiler_Widget_YouTube' ) );
	this.addWidget( $injector.get( 'WidgetCompiler_Widget_Vimeo' ) );
	this.addWidget( $injector.get( 'WidgetCompiler_Widget_Soundcloud' ) );

	/**
	 * Compiles any widgets in the content provided.
	 * Creates isolate child scopes for each widget and attaches their scopes to the scope passed in.
	 * This allows it to destroy the child scopes correctly when the parent is destroyed.
	 * Any reruns of this call will check for any child widget scopes on the scope passed in and destroy
	 * them. This ensure you can continue compiling the same content on the scope and it should work.
	 *
	 * @param {[type]} scope [description]
	 * @param {[type]} content [description]
	 * @return {[type]} [description]
	 */
	this.compile = function( scope, content )
	{
		if ( !content ) {
			return '';
		}

		if ( scope.__widgetCompilerChildScopes && scope.__widgetCompilerChildScopes.length ) {
			angular.forEach( scope.__widgetCompilerChildScopes, function( childScope )
			{
				childScope.$destroy();
			} );
		}

		scope.__widgetCompilerChildScopes = [];

		var compiledInput = '';
		var workingInput = content;
		var matchInfo = null;
		var match = null;
		var innerMatch = null;
		var previousIndex = 0;
		var widgetInjections = {};

		// Loop through each match that looks like a widget.
		while ( matchInfo = workingInput.match( _regex.widget ) ) {

			match = matchInfo[0];
			innerMatch = matchInfo[1];

			// Add in the text up until this regex match.
			compiledInput += workingInput.substring( previousIndex, matchInfo.index );

			// Process this match.
			var injectedWidget = _processWidgetMatch( scope, innerMatch );
			if ( injectedWidget ) {

				// This is magic... o_O
				var token = Math.random().toString( 36 ).substr( 2 );

				// Make a placeholder div that we can inject in to later.
				compiledInput += '<div id="_inj_' + token + '_"></div>';

				// Now save this injection.
				widgetInjections['_inj_' + token + '_'] = injectedWidget.element;

				// Store its scope so we can clean up properly as well.
				scope.__widgetCompilerChildScopes.push( injectedWidget.scope );
			}

			// Pull the new working input text to process.
			// It's just anything that was after our match.
			// This way we keep processing from where we left off.
			workingInput = workingInput.substring( matchInfo.index + match.length );
		}

		// Get the remaining portion of input after the last widget (if there were any).
		compiledInput += workingInput.substring( previousIndex );

		// Convert our compiled input into an element.
		// Wrap in a div so we can do finds on it.
		var compiledElement = angular.element( '<div>' + compiledInput + '</div>' );

		// If we've gathered any injections, let's put them in.
		angular.forEach( widgetInjections, function( injectionElement, id )
		{
			// Replace with our compiled injection element!
			angular.element( compiledElement[0].querySelector( '#' + id ) ).replaceWith( injectionElement[0] );
		} );

		return compiledElement;
	};

	/**
	 * Processes a widget match.
	 * Will attempt to figure out the widget that they were trying to call
	 * and call its compilation function.
	 */
	function _processWidgetMatch( scope, match )
	{
		// Trim whitespace.
		match = match.replace( _regex.whitespaceTrim, '' );

		// Collapse multiple occurrences of stringed whitespace into one space.
		match = match.replace( _regex.whitespace, ' ' );

		// Now split on spaces to get the params.
		var params = match.split( ' ' );
		if ( !params || !params.length ) {
			return null;
		}

		var widgetName = params[0];
		if ( !_widgets[widgetName] ) {
			return null;
		}

		// Remove the widget name off the params.
		params.shift();

		// Create a new isolate scope for this widget attached to the parent scope passed in.
		var childScope = scope.$new( true );

		// Call the widget's service.
		var element = _widgets[widgetName]( childScope, params );

		// If the widget didn't return correctly, then destroy our child scope and return null.
		if ( !element ) {
			childScope.$destroy();
			return null;
		}

		// Otherwise return the new data.
		return {
			element: element,
			scope: childScope
		};
	}
} );
