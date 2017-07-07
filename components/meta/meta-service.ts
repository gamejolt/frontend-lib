import { MetaContainer } from './meta-container';
import { FbMetaContainer } from './fb-meta-container';
import { TwitterMetaContainer } from './twitter-meta-container';
import { MicrodataContainer } from './microdata-container';
import { Environment } from '../environment/environment.service';

export class Meta extends MetaContainer {
	private static _title = '';
	private static _originalTitle = !GJ_IS_SSR ? document.title : null;
	private static _fb = FbMetaContainer;
	private static _twitter = TwitterMetaContainer;
	private static _microdata = MicrodataContainer;

	static titleSuffix = GJ_IS_CLIENT ? ' - Game Jolt' : ' on Game Jolt';

	// TODO
	// static initAngular( $rootScope: any )
	// {
	// 	$rootScope.$on( '$stateChangeSuccess', () =>
	// 	{
	// 		this.clear();
	// 	} );
	// }

	static set title(title: string | null) {
		if (title) {
			title += this.titleSuffix;
		} else {
			title = this._originalTitle;
		}

		if (title) {
			if (!GJ_IS_SSR) {
				document.title = title;
			}
			this._title = title;
			Environment.ssrContext.meta.title = title;
		}
	}

	static get title() {
		return this._title;
	}

	static set description(value: string | null) {
		this._set('description', value);
	}
	static get description() {
		return this._get('description');
	}

	static set redirect(value: string | null) {
		this._set('redirect', value);
	}
	static get redirect() {
		return this._get('redirect');
	}

	static set responseCode(value: string | null) {
		this._set('responseCode', value);
	}
	static get responseCode() {
		return this._get('responseCode');
	}

	static set fb(values: any) {
		Object.assign(this._fb, values);
	}

	static get fb() {
		return this._fb;
	}

	static set twitter(values: any) {
		Object.assign(this._twitter, values);
	}

	static get twitter() {
		return this._twitter;
	}

	static set microdata(microdata: Object) {
		this._microdata.set(microdata);
	}

	static clear() {
		this.description = null;
		this.redirect = null;
		this.responseCode = null;

		this.fb = {
			title: null,
			description: null,
			url: null,
			type: null,
			image: null,
			profileId: null,
		};

		this.twitter = {
			title: null,
			description: null,
			card: null,
			image: null,
			url: null,
			shareMessage: null,
		};

		this._microdata.clear();
	}
}
