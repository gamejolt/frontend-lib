export type RequireContextMap = { [k: string]: string };

export function importContext(r: WebpackContext) {
	let map: RequireContextMap = {};
	r.keys().forEach(key => (map[key] = r(key)));
	return map;
}

export function asyncComponentLoader(loader: Promise<any>) {
	return loader.then(mod => mod.default);
}

export function loadScript(src: string) {
	return new Promise((resolve, reject) => {
		const script = window.document.createElement('script');
		script.type = 'text/javascript';
		script.async = true;

		const docHead = window.document.head || window.document.getElementsByTagName('head')[0];
		docHead.appendChild(script);

		script.onload = resolve;
		script.onerror = reject;
		script.src = src;
	});
}

export function LoaderFunc() {
	return function(
		_: any,
		__: string,
		descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>
	) {
		return descriptor;
	};
}

// For exhaustive switch matching: https://www.typescriptlang.org/docs/handbook/advanced-types.html
export function assertNever(x: never): never {
	throw new Error('Unexpected object: ' + x);
}
