export function objectEquals(a: any, b: any) {
	const aProps = Object.getOwnPropertyNames(a);
	const bProps = Object.getOwnPropertyNames(b);

	if (aProps.length !== bProps.length) {
		return false;
	}

	for (const propName of aProps) {
		if (a[propName] !== b[propName]) {
			return false;
		}
	}

	return true;
}

export function objectPick<T>(source: T, fields: (keyof T)[]) {
	const obj: any = {};
	for (const field of fields) {
		obj[field] = source[field];
	}

	return obj;
}
