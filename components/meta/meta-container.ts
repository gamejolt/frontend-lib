export class MetaField {
	original: string | null;
	current: string | null;
}

export class MetaContainer {
	protected _attr = 'name';
	protected _fields: { [key: string]: MetaField } = {};

	set(name: string, content: string | null) {
		this._storeField(name, content);

		if (GJ_IS_SSR) {
			return;
		}

		let elem = document.head.querySelector(`meta[${this._attr}="${name}"]`) as HTMLMetaElement;

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
			elem.setAttribute(this._attr, name);
			document.head.appendChild(elem);
		}

		elem.content = content;
	}

	get(name: string) {
		return this._fields[name] ? this._fields[name].current : null;
	}

	render() {
		let output = '';

		for (const key in this._fields) {
			const field = this._fields[key];
			if (field.current) {
				output += `<meta ${this._attr}="${key}" content="${field.current}">`;
			}
		}

		return output;
	}

	protected _storeField(name: string, content: string | null) {
		if (!this._fields[name]) {
			const field = new MetaField();

			if (!GJ_IS_SSR) {
				const elem = document.head.querySelector(
					`meta[${this._attr}="${name}"]`
				) as HTMLMetaElement;
				if (elem) {
					field.original = elem.content;
				}
			}

			this._fields[name] = field;
		}

		this._fields[name].current = content;
	}
}
