angular.module( 'gj.Translate' ).provider( 'Translate', function()
{
	var provider = this;
	var languageUrls = {};
	var LANG_STORAGE_KEY = 'lang';

	provider.addLanguageUrls = function( urls )
	{
		languageUrls = urls;
	};

	this.$get = function( $q, $injector, $window, gettextCatalog )
	{
		var Translate = {};

		var sections = [];
		var loaded = {};

		Translate.lang = localStorage.getItem( LANG_STORAGE_KEY ) || 'en_US';
		gettextCatalog.setCurrentLanguage( Translate.lang );

		Translate.langs = this.langs = [
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

		Translate.langsByCode = _.indexBy( Translate.langs, 'code' );

		Translate.loadSection = function( section, lang )
		{
			lang = lang || Translate.lang;

			if ( !languageUrls[ section ] ) {
				throw new Error( 'Tried loading invalid section for translations.' );
			}

			if ( !languageUrls[ section ][ lang ] ) {
				throw new Error( 'Tried loading invalid language for translations.' );
			}

			if ( sections.indexOf( section ) === -1 ) {
				sections.push( section )
			}

			// Only load each section once per language.
			if ( loaded[ lang + section ] ) {
				return $q.resolve();
			}

			loaded[ lang + section ] = true;

			return gettextCatalog.loadRemote( languageUrls[ section ][ lang ] );
		};

		Translate.setLanguage = function( lang )
		{
			localStorage.setItem( LANG_STORAGE_KEY, lang );
			Translate.lang = lang;

			// Gotta change all our current sections loaded in to the new language before
			// we can set it in the UI.
			var loadSections = sections.map( function( section )
			{
				return Translate.loadSection( section, lang );
			} );

			return $q.all( loadSections ).then( function()
			{
				gettextCatalog.setCurrentLanguage( lang );
			} );
		};

		return Translate;
	};
} );
