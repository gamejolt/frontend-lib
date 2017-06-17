export function arrayUnique<T>(values: T[]) {
	return values.filter((value, index) => {
		return values.indexOf(value) === index;
	});
}

export function stringSort(a: string, b: string) {
	a = a.toLowerCase();
	b = b.toLowerCase();

	if (a < b) {
		return -1;
	} else if (a > b) {
		return 1;
	}
	return 0;
}

export function numberSort(a: number, b: number) {
	if (a < b) {
		return -1;
	} else if (a > b) {
		return 1;
	}
	return 0;
}

export function arrayIndexBy<T>(
	values: T[],
	field: keyof T
): { [k: string]: T } {
	const indexed: any = {};
	values.forEach(item => (indexed[item[field] + ''] = item));
	return indexed;
}

export function arrayIndexByFunc<T>(
	values: T[],
	fn: (item: T) => any
): { [k: string]: T } {
	const indexed: any = {};
	values.forEach(item => (indexed[fn(item) + ''] = item));
	return indexed;
}
