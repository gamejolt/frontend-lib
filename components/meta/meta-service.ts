import VueRouter from 'vue-router';
import { makeObservableService } from '../../utils/vue';
import { Environment } from '../environment/environment.service';
import { FbMetaContainer } from './fb-meta-container';
import { MetaContainer } from './meta-container';
import { MicrodataContainer } from './microdata-container';
import { TwitterMetaContainer } from './twitter-meta-container';

export function escapeString(str: string) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;');
}

export class Meta extends MetaContainer {
	static titleSuffix = GJ_IS_CLIENT ? ' - Game Jolt' : ' on Game Jolt';

	private static _title = '';
	private static _originalTitle = !GJ_IS_SSR ? document.title : null;
	private static _base = new MetaContainer();
	private static _fb = new FbMetaContainer();
	private static _twitter = new TwitterMetaContainer();
	private static _microdata = new MicrodataContainer();

	private static _baseTitle: string | null = null;
	private static _notificationCount = 0;
	private static _chatCount = 0;

	static init(router: VueRouter) {
		router.beforeEach((_to, _from, next) => {
			this.clear();
			next();
		});
	}

	static set title(title: string | null) {
		this._baseTitle = title;
		this.updatePageTitle();
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

	static set notificationCount(count: number) {
		this._notificationCount = count;
		this.updatePageTitle();
	}

	static set chatCount(count: number) {
		this._chatCount = count;
		this.updatePageTitle();
	}

	private static updatePageTitle() {
		let title = this._baseTitle;

		if (title) {
			title += this.titleSuffix;
		} else {
			title = this._originalTitle;
		}

		let unreadCount = this._notificationCount + this._chatCount;
		if (unreadCount > 99) {
			unreadCount = 99;
		}
		if (unreadCount > 0) {
			title = `(${unreadCount}) ${title}`;
		}

		if (title) {
			if (!GJ_IS_SSR) {
				document.title = title;
			}
			this._title = title;

			// We escape in the template, so no need to escape here.
			Environment.ssrContext.meta.title = title;
		}
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
			this._base.render() +
			this._fb.render() +
			this._twitter.render() +
			this._microdata.render()
		);
	}
}

makeObservableService(Meta);
