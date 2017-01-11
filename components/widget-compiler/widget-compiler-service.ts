import { Injectable, Inject } from 'ng-metadata/core';
import { WidgetCompilerWidget } from './widget';
import { WidgetCompilerWidgetYoutube } from './widget-youtube.service';
import { WidgetCompilerWidgetVimeo } from './widget-vimeo.service';
import { WidgetCompilerWidgetSoundcloud } from './widget-soundcloud.service';

const REGEX = {

	// Match widget definitions: {% activity-feed %}
	// {%(whitespace character)(none new line character -- greedy match)(whitespace character)%}
	// Global match
	widget: /\{\%\s(.+?)\s\%\}/,

	// To match any whitespace.
	whitespace: /\s+/g,

	// Polyfill from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
	whitespaceTrim: /^\s+|\s+$/g
};

@Injectable()
export class WidgetCompiler
{
	widgets: { [k: string]: WidgetCompilerWidget } = {};
	private contentClass = 'widget-compiler-compiled-content';

	constructor(
		@Inject( 'WidgetCompilerWidgetYoutube' ) widgetYoutube: WidgetCompilerWidgetYoutube,
		@Inject( 'WidgetCompilerWidgetVimeo' ) widgetVimeo: WidgetCompilerWidgetVimeo,
		@Inject( 'WidgetCompilerWidgetSoundcloud' ) widgetSoundcloud: WidgetCompilerWidgetSoundcloud,
	)
	{
		// Add in default widgets.
		this.addWidget( widgetYoutube );
		this.addWidget( widgetVimeo );
		this.addWidget( widgetSoundcloud );
	}

	addWidget( widgetService: WidgetCompilerWidget )
	{
		this.widgets[ widgetService.name ] = widgetService;
	}

	setContentClass( contentClass: string )
	{
		this.contentClass = contentClass;
	}

	/**
	 * Compiles any widgets in the content provided.
	 * Creates isolate child scopes for each widget and attaches their scopes to the scope passed in.
	 * This allows it to destroy the child scopes correctly when the parent is destroyed.
	 * Any reruns of this call will check for any child widget scopes on the scope passed in and destroy
	 * them. This ensure you can continue compiling the same content on the scope and it should work.
	 */
	compile( scope: ng.IScope, content: string ): ng.IAugmentedJQuery | undefined
	{
		if ( !content ) {
			return undefined;
		}

		if ( scope['__widgetCompilerChildScopes'] && scope['__widgetCompilerChildScopes'].length ) {
			scope['__widgetCompilerChildScopes'].forEach( ( childScope: ng.IScope ) =>
			{
				childScope.$destroy();
			} );
		}

		scope['__widgetCompilerChildScopes'] = [];

		let compiledInput = `<div class="${this.contentClass}">`;
		let workingInput = content;
		let widgetInjections: any = {};

		// Loop through each match that looks like a widget.
		let matchInfo: RegExpMatchArray | null = null;
		while ( matchInfo = workingInput.match( REGEX.widget ) ) {

			if ( !matchInfo ) {
				continue;
			}

			const match = matchInfo[0];
			const innerMatch = matchInfo[1];

			// Add in the text up until this regex match.
			compiledInput += workingInput.substring( 0, matchInfo.index );

			// Process this match.
			const injectedWidget = this.processWidgetMatch( scope, innerMatch );
			if ( injectedWidget ) {

				// This is magic... o_O
				const token = Math.random().toString( 36 ).substr( 2 );

				// Make a placeholder div that we can inject in to later.
				compiledInput += `</div><div id="_inj_${token}_"></div><div class="${this.contentClass}">`;

				// Now save this injection.
				widgetInjections['_inj_' + token + '_'] = injectedWidget.element;

				// Store its scope so we can clean up properly as well.
				scope['__widgetCompilerChildScopes'].push( injectedWidget.scope );
			}

			// Pull the new working input text to process.
			// It's just anything that was after our match.
			// This way we keep processing from where we left off.
			workingInput = workingInput.substring( matchInfo.index + match.length );
		}

		// Get the remaining portion of input after the last widget (if there were any).
		compiledInput += workingInput + '</div>';

		// Convert our compiled input into an element.
		// Wrap in a div so we can do finds on it.
		const compiledElement = angular.element( '<div>' + compiledInput + '</div>' );

		// If we've gathered any injections, let's put them in.
		angular.forEach( widgetInjections, ( injectionElement, id ) =>
		{
			// Replace with our compiled injection element!
			angular
				.element( compiledElement[0].querySelector( '#' + id ) as HTMLElement )
				.replaceWith( injectionElement[0] );
		} );

		return compiledElement;
	};

	/**
	 * Processes a widget match.
	 * Will attempt to figure out the widget that they were trying to call
	 * and call its compilation function.
	 */
	private processWidgetMatch( scope: ng.IScope, match: string )
	{
		// Trim whitespace.
		match = match.replace( REGEX.whitespaceTrim, '' );

		// Collapse multiple occurrences of stringed whitespace into one space.
		match = match.replace( REGEX.whitespace, ' ' );

		// Now split on spaces to get the params.
		const params = match.split( ' ' );
		if ( !params || !params.length ) {
			return undefined;
		}

		const widgetName = params[0];
		if ( !this.widgets[ widgetName ] ) {
			return undefined;
		}

		// Remove the widget name off the params.
		params.shift();

		// Create a new isolate scope for this widget attached to the parent scope passed in.
		const childScope = scope.$new( true );

		// Call the widget's service.
		const element = this.widgets[ widgetName ].compile( childScope, params );

		// If the widget didn't return correctly, then destroy our child scope and return null.
		if ( !element ) {
			childScope.$destroy();
			return undefined;
		}

		// Otherwise return the new data.
		return {
			element: element,
			scope: childScope
		};
	}
}
