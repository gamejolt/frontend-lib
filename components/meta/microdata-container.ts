export class MicrodataContainer {
	// private static _document = window.document;
	// private static _head = MicrodataContainer._document.head;

	static microdata: any | undefined;

	static set(microdata: any) {
		this.microdata = microdata;

		if (GJ_IS_SSR) {
			return;
		}

		let elem = document.head.querySelector(
			'script[type="application/ld+json"]'
		) as HTMLScriptElement;
		if (elem) {
			this.clear();
		}

		elem = document.createElement('script');
		elem.type = 'application/ld+json';
		elem.text = JSON.stringify(microdata);
		document.head.appendChild(elem);
	}

	static clear() {
		this.microdata = undefined;

		if (GJ_IS_SSR) {
			return;
		}

		let elem = document.head.querySelector(
			'script[type="application/ld+json"]'
		) as HTMLScriptElement;
		if (elem) {
			document.head.removeChild(elem);
		}
	}
}
