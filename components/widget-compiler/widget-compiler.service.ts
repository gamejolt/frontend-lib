import Vue from 'vue';
import { WidgetCompilerWidget } from './widget';
import { WidgetCompilerWidgetYoutube } from './widget-youtube/widget-youtube.service';
import { WidgetCompilerWidgetVimeo } from './widget-vimeo/widget-vimeo.service';
import { WidgetCompilerWidgetSoundcloud } from './widget-soundcloud/widget-soundcloud.service';

const REGEX = {
	// Match widget definitions: {% activity-feed %}
	// {%(whitespace character)(none new line character -- greedy match)(whitespace character)%}
	// Global match
	widget: /\{\%\s(.+?)\s\%\}/,

	// To match any whitespace.
	whitespace: /\s+/g,

	// Polyfill from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
	whitespaceTrim: /^\s+|\s+$/g,
};

export class WidgetCompilerContext {
	__widgetCompilerChildren: Vue[] = [];
	[k: string]: any;

	destroy() {
		this.__widgetCompilerChildren.forEach(child => {
			child.$destroy();
		});

		this.__widgetCompilerChildren = [];
	}
}

export class WidgetCompiler {
	static widgets: { [k: string]: WidgetCompilerWidget } = {};
	private static contentClass = 'widget-compiler-compiled-content';

	static addWidget(widgetService: WidgetCompilerWidget) {
		this.widgets[widgetService.name] = widgetService;
	}

	static setContentClass(contentClass: string) {
		this.contentClass = contentClass;
	}

	static getContentClass() {
		return this.contentClass;
	}

	/**
	 * Compiles any widgets in the content provided.
	 * Creates isolate child scopes for each widget and attaches their scopes to the scope passed in.
	 * This allows it to destroy the child scopes correctly when the parent is destroyed.
	 * Any reruns of this call will check for any child widget scopes on the scope passed in and destroy
	 * them. This ensure you can continue compiling the same content on the scope and it should work.
	 */
	static compile(context: WidgetCompilerContext, content: string): HTMLElement | undefined {
		if (!content) {
			return undefined;
		}

		context.destroy();

		let compiledInput = `<div class="${this.contentClass}">`;
		let workingInput = content;
		let widgetInjections: { [k: string]: Vue } = {};

		// Loop through each match that looks like a widget.
		let matchInfo: RegExpMatchArray | null = null;
		while ((matchInfo = workingInput.match(REGEX.widget))) {
			if (!matchInfo) {
				continue;
			}

			const match = matchInfo[0];
			const innerMatch = matchInfo[1];

			// Add in the text up until this regex match.
			compiledInput += workingInput.substring(0, matchInfo.index);

			// Process this match.
			const injectedWidget = this.processWidgetMatch(context, innerMatch);
			if (injectedWidget) {
				// This is magic... o_O
				const token = Math.random().toString(36).substr(2);

				// Make a placeholder div that we can inject in to later.
				compiledInput += `</div><div id="_inj_${token}_"></div><div class="${this.contentClass}">`;

				// Now save this injection.
				widgetInjections['_inj_' + token + '_'] = injectedWidget;
				context.__widgetCompilerChildren.push(injectedWidget);
			}

			// Pull the new working input text to process.
			// It's just anything that was after our match.
			// This way we keep processing from where we left off.
			workingInput = workingInput.substring(matchInfo.index + match.length);
		}

		// Get the remaining portion of input after the last widget (if there were any).
		compiledInput += workingInput + '</div>';

		// Convert our compiled input into an element.
		// Wrap in a div so we can do finds on it.
		const compiledElement = document.createElement('div');
		compiledElement.className = 'widget-compiler';
		compiledElement.innerHTML = compiledInput;

		// If we've gathered any injections, let's put them in.
		for (const id in widgetInjections) {
			const injectionElement = widgetInjections[id];
			const slot = compiledElement.querySelector('#' + id) as HTMLElement;
			injectionElement.$mount(slot);
		}

		// Clean all empty tags out.
		this.cleanEmptyContent(compiledElement);

		return compiledElement;
	}

	/**
	 * Processes a widget match.
	 * Will attempt to figure out the widget that they were trying to call
	 * and call its compilation function.
	 */
	private static processWidgetMatch(context: WidgetCompilerContext, match: string) {
		// Trim whitespace.
		match = match.replace(REGEX.whitespaceTrim, '');

		// Collapse multiple occurrences of stringed whitespace into one space.
		match = match.replace(REGEX.whitespace, ' ');

		// Now split on spaces to get the params.
		const params = match.split(' ');
		if (!params || !params.length) {
			return undefined;
		}

		const widgetName = params[0];
		if (!this.widgets[widgetName]) {
			return undefined;
		}

		// Remove the widget name off the params.
		params.shift();

		// Call the widget's service.
		return this.widgets[widgetName].compile(context, params);
	}

	private static cleanEmptyContent(compiledElement: HTMLElement) {
		let emptyElems = compiledElement.querySelectorAll('p:empty');
		for (let i = 0; i < emptyElems.length; ++i) {
			const elem = emptyElems[i];
			elem.parentNode!.removeChild(elem);
		}

		emptyElems = compiledElement.querySelectorAll('div:empty');
		for (let i = 0; i < emptyElems.length; ++i) {
			const elem = emptyElems[i];
			elem.parentNode!.removeChild(elem);
		}
	}
}

// Add in default widgets.
WidgetCompiler.addWidget(new WidgetCompilerWidgetYoutube());
WidgetCompiler.addWidget(new WidgetCompilerWidgetVimeo());
WidgetCompiler.addWidget(new WidgetCompilerWidgetSoundcloud());
