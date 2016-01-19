angular.module( 'gj.Translate.LangSelector' ).directive( 'gjTranslateLangSelector', function( Analytics, Translate )
{
	return {
		restrict: 'E',
		templateUrl: '/lib/gj-lib-client/components/translate/lang-selector/lang-selector.html',
		scope: {
			onLangChangeEvent: '&?onLangChange',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function()
		{
			var _this = this;

			this.langs = [
				{
					code: 'en',
					label: 'English (UK)',
				},
				{
					code: 'en_US',
					label: 'English (US)',
				},
				{
					code: 'nl',
					label: 'Nederlands',
				},
				{
					code: 'ro',
					label: 'Română',
				},
				{
					code: 'de',
					label: 'Deutsch',
				},
				{
					code: 'es',
					label: 'Español',
				},
				{
					code: 'fr',
					label: 'Français',
				},
				{
					code: 'ru',
					label: 'Русский',
				},
				{
					code: 'sv',
					label: 'Svenska',
				},
				{
					code: 'tr',
					label: 'Türkçe',
				},
				{
					code: 'pt',
					label: 'Português (Portugal)',
				},
				{
					code: 'pt_BR',
					label: 'Português (Brasil)',
				},
				{
					code: 'fi',
					label: 'Suomi',
				},
				{
					code: 'nb',
					label: 'Norsk (bokmål)',
				},
				{
					code: 'el',
					label: 'Ελληνικά',
				},
				{
					code: 'ms',
					label: 'Bahasa Melayu',
				},
				{
					code: 'pl',
					label: 'Polski',
				},
				{
					code: 'uk',
					label: 'Українська',
				},
			];

			this.lang = Translate.lang;
			this.onLangChange = function( newLang )
			{
				Analytics.trackEvent( 'translations', 'change', newLang ).then( function()
				{
					// We don't wait for the promise to resolve before firing the event.
					// This way they can reload the window without any language flicker.
					Translate.setLanguage( newLang );
					if ( _this.onLangChangeEvent ) {
						_this.onLangChangeEvent();
					}
				} );
			};
		}
	};
} );
