export class MetaField {
	original: string | null;
	current: string | null;
}

export class MetaContainer {
	private static _document = window.document;
	private static _head = MetaContainer._document.head;
	private static _fields: { [key: string]: MetaField } = {};

	protected static _set(name: string, content: string | null) {
		this._storeField(name, content);

		let elem = this._head.querySelector(
			`meta[name="${name}"]`,
		) as HTMLMetaElement;

		// Remove if we're nulling it out.
		if (!content) {
			if (elem) {
				this._head.removeChild(elem);
			}
			return;
		}

		// Create if not exists.
		if (!elem) {
			elem = this._document.createElement('meta');
			elem.name = name;
			this._head.appendChild(elem);
		}

		elem.content = content;
	}

	protected static _get(name: string) {
		return this._fields[name] ? this._fields[name].current : null;
	}

	protected static _storeField(name: string, content: string | null) {
		if (!this._fields[name]) {
			const field = new MetaField();

			const elem = this._head.querySelector(
				`meta[name="${name}"]`,
			) as HTMLMetaElement;
			if (elem) {
				field.original = elem.content;
			}

			this._fields[name] = field;
		}

		this._fields[name].current = content;
	}
}
