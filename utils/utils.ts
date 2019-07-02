import { isError } from 'util';

export type RequireContextMap = { [k: string]: string };

export function importContext(r: WebpackContext) {
	let map: RequireContextMap = {};
	r.keys().forEach(key => (map[key] = r(key)));
	return map;
}

export function asyncComponentLoader(loader: Promise<any>) {
	return loader.then(mod => mod.default);
}

type LoadScriptOptions = Partial<{
	element: Element;
	dataset: DOMStringMap;
	sync: boolean;
}>;

export function loadScript(src: string, options?: LoadScriptOptions) {
	return new Promise((resolve, reject) => {
		if (options === undefined) {
			options = {};
		}

		const script = window.document.createElement('script');
		script.type = 'text/javascript';
		script.async = !options.sync;

		const el =
			options.element ||
			window.document.head ||
			window.document.getElementsByTagName('head')[0];
		el.appendChild(script);

		const dataset = options.dataset;
		if (dataset !== undefined) {
			Object.assign(script.dataset, options.dataset || {});
		}

		script.onload = resolve;
		script.onerror = reject;
		script.src = src;
	});
}

export function sleep(ms: number) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

// For exhaustive switch matching: https://www.typescriptlang.org/docs/handbook/advanced-types.html
export function assertNever(x: never): never {
	throw new Error('Unexpected object: ' + x);
}

export type Primitives = Number | String | Boolean;
export type Properties<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];

export function isErrnoException(err: any): err is NodeJS.ErrnoException {
	return isError(err) && typeof (err as any).code === 'string' && !!(err as any).code;
}

export function isPromise(obj: any) {
	return (
		!!obj &&
		(typeof obj === 'object' || typeof obj === 'function') &&
		typeof obj.then === 'function'
	);
}
