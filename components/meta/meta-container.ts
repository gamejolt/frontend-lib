export class MetaField {
	original: string | null;
	current: string | null;
}

export class MetaContainer {
	private static _fields: { [key: string]: MetaField } = {};

	protected static _set(name: string, content: string | null) {
		this._storeField(name, content);

		if (GJ_IS_SSR) {
			return;
		}

		let elem = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;

		// Remove if we're nulling it out.
		if (!content) {
			if (elem) {
				document.head.removeChild(elem);
			}
			return;
		}

		// Create if not exists.
		if (!elem) {
			elem = document.createElement('meta');
			elem.name = name;
			document.head.appendChild(elem);
		}

		elem.content = content;
	}

	protected static _get(name: string) {
		return this._fields[name] ? this._fields[name].current : null;
	}

	protected static _storeField(name: string, content: string | null) {
		if (!this._fields[name]) {
			const field = new MetaField();

			if (!GJ_IS_SSR) {
				const elem = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
				if (elem) {
					field.original = elem.content;
				}
			}

			this._fields[name] = field;
		}

		this._fields[name].current = content;
	}
}
