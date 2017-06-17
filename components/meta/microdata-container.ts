export class MicrodataContainer {
	private static _document = window.document;
	private static _head = MicrodataContainer._document.head;

	static set(microdata: Object) {
		let elem = this._head.querySelector(
			'script[type="application/ld+json"]'
		) as HTMLScriptElement;
		if (elem) {
			this.clear();
		}

		elem = this._document.createElement('script');
		elem.type = 'application/ld+json';
		elem.text = JSON.stringify(microdata);
		this._head.appendChild(elem);
	}

	static clear() {
		let elem = this._head.querySelector(
			'script[type="application/ld+json"]'
		) as HTMLScriptElement;
		if (elem) {
			this._head.removeChild(elem);
		}
	}
}
