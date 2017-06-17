export abstract class LoaderBase {
	isReady = false;
	abstract name: string;

	private loadPromise?: Promise<void>;

	protected abstract _load(): Promise<void>;

	load() {
		if (!this.loadPromise) {
			this.loadPromise = this._load().then(() => {
				this.isReady = true;
			});
		}

		return this.loadPromise;
	}
}
