interface WebpackRequireEnsureCallback {
	(req: WebpackRequire): void;
}

interface WebpackRequire {
	(id: string): any;
	(paths: string[], callback: (...modules: any[]) => void): void;
	ensure(
		ids: string[],
		callback: WebpackRequireEnsureCallback,
		chunkName?: string,
	): Promise<void>;
	context(
		directory: string,
		useSubDirectories?: boolean,
		regExp?: RegExp,
	): WebpackContext;
}

interface WebpackContext extends WebpackRequire {
	keys(): string[];
}

declare var require: WebpackRequire;
declare function $import(path: string): Promise<any>
