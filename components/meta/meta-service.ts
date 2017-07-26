import VueRouter from 'vue-router';
import { MetaContainer } from './meta-container';
import { FbMetaContainer } from './fb-meta-container';
import { TwitterMetaContainer } from './twitter-meta-container';
import { MicrodataContainer } from './microdata-container';
import { Environment } from '../environment/environment.service';

export class Meta extends MetaContainer {
	static titleSuffix = GJ_IS_CLIENT ? ' - Game Jolt' : ' on Game Jolt';

	private static _title = '';
	private static _originalTitle = !GJ_IS_SSR ? document.title : null;
	private static _base = new MetaContainer();
	private static _fb = new FbMetaContainer();
	private static _twitter = new TwitterMetaContainer();
	private static _microdata = new MicrodataContainer();

	static init(router: VueRouter) {
		router.beforeEach((_to, _from, next) => {
			this.clear();
			next();
		});
	}

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
		this._base.set('description', value);
	}
	static get description() {
		return this._base.get('description');
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

	static render() {
		return (
			this._base.render() + this._fb.render() + this._twitter.render() + this._microdata.render()
		);
	}
}
