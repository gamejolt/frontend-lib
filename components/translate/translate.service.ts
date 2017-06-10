import Vue from 'vue';
import { getProvider } from '../../utils/utils';
import { arrayIndexBy } from '../../utils/array';

const LangStorageKey = 'lang';

const translator = new Vue();

export class Translate
{
	private static languageUrls: any;
	private static sections: string[] = [];
	private static loaded: { [k: string]: boolean } = {};

	static lang = (typeof localStorage !== 'undefined' && localStorage.getItem( LangStorageKey )) || 'en_US';

	static readonly langs = [
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

	static langsByCode = arrayIndexBy( Translate.langs, 'code' );

	static $gettext( msgid: string )
	{
		return translator.$gettext( msgid );
	}

	static $gettextInterpolate( msgid: string, context: any )
	{
		return translator.$gettextInterpolate( msgid, context );
	}

	static addLanguageUrls( urls: any )
	{
		this.languageUrls = urls;
	}

	static loadSection( gettextCatalog: any, section: string, lang?: string )
	{
		lang = lang || this.lang;

		if ( !this.languageUrls[ section ] ) {
			throw new Error( 'Tried loading invalid section for translations.' );
		}

		if ( !this.languageUrls[ section ][ lang ] ) {
			throw new Error( 'Tried loading invalid language for translations.' );
		}

		if ( this.sections.indexOf( section ) === -1 ) {
			this.sections.push( section )
		}

		// Only load each section once per language.
		if ( this.loaded[ lang + section ] ) {
			return Promise.resolve();
		}

		this.loaded[ lang + section ] = true;

		return gettextCatalog.loadRemote( this.languageUrls[ section ][ lang ] );
	}

	static async setLanguage( gettextCatalog: any, lang: string )
	{
		localStorage.setItem( LangStorageKey, lang );
		this.lang = lang;

		// Gotta change all our current sections loaded in to the new language before
		// we can set it in the UI.
		const loadSections = this.sections.map( ( section ) => this.loadSection( section, lang ) );
		await Promise.all( loadSections );

		gettextCatalog.setCurrentLanguage( lang );
	}
}
