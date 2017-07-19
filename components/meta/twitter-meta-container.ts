import { MetaContainer } from './meta-container';

export class TwitterMetaContainer extends MetaContainer {
	// TODO(rewrite): Get this working.
	static shareMessage: string;

	static set card(value: string | null) {
		this._set('twitter:card', value);
	}
	static get card() {
		return this._get('twitter:card');
	}

	static set title(value: string | null) {
		this._set('twitter:title', value);
	}
	static get title() {
		return this._get('twitter:title');
	}

	static set description(value: string | null) {
		this._set('twitter:description', value);
	}
	static get description() {
		return this._get('twitter:description');
	}

	static set image(value: string | null) {
		this._set('twitter:image', value);
	}
	static get image() {
		return this._get('twitter:image');
	}

	static set url(value: string | null) {
		this._set('twitter:url', value);
	}
	static get url() {
		return this._get('twitter:url');
	}
}
