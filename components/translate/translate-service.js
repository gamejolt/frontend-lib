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
				code: 'en_AU',
				label: 'English (Australia)',
			},
			{
				// Dutch
				code: 'nl',
				label: 'Nederlands',
			},
			{
				// Romanian
				code: 'ro',
				label: 'Română',
			},
			{
				// German
				code: 'de',
				label: 'Deutsch',
			},
			{
				// Spanish
				code: 'es',
				label: 'Español',
			},
			{
				// Spanish (Argentina)
				code: 'es_AR',
				label: 'Español (Argentina)',
			},
			{
				// Spanish (LA&C)
				code: 'es_419',
				label: 'Español (America Latina)',
			},
			{
				// Spanish (Columbia)
				code: 'es_CO',
				label: 'Español (Colombia)',
			},
			{
				// Spanish (Mexico)
				code: 'es_MX',
				label: 'Español (México)',
			},
			{
				// French
				code: 'fr',
				label: 'Français',
			},
			{
				// Russian
				code: 'ru',
				label: 'Русский',
			},
			{
				// Swedish
				code: 'sv',
				label: 'Svenska',
			},
			{
				// Turkish
				code: 'tr',
				label: 'Türkçe',
			},
			{
				// Portuguese
				code: 'pt',
				label: 'Português (Portugal)',
			},
			{
				// Portuguese (Brazil)
				code: 'pt_BR',
				label: 'Português (Brasil)',
			},
			{
				// Finnish
				code: 'fi',
				label: 'Suomi',
			},
			{
				// Norwegian
				code: 'nb',
				label: 'Norsk (bokmål)',
			},
			{
				// Greek
				code: 'el',
				label: 'Ελληνικά',
			},
			{
				// Malay
				code: 'ms',
				label: 'Bahasa Melayu',
			},
			{
				// Polish
				code: 'pl',
				label: 'Polski',
			},
			{
				// Ukranian
				code: 'uk',
				label: 'Українська',
			},
			{
				// Italian
				code: 'it',
				label: 'Italiano',
			},
			{
				// Traditional Chinese (Taiwan)
				code: 'zh_TW',
				label: '中文(台灣)',
			},
			{
				// Croation
				code: 'hr',
				label: 'Hrvatski',
			},
			{
				// Indonesian
				code: 'id',
				label: 'Bahasa Indonesia',
			},
			{
				// Czech
				code: 'cs',
				label: 'Čeština',
			},
			{
				// Bulgarian
				code: 'bg',
				label: 'Български',
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
