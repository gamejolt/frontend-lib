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
