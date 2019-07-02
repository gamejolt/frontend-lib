import Console from '../../../utils/console';
import { loadScript } from '../../../utils/utils';

export default class PlaywireBoltEmbed {
	private static _nextId = 0;

	public readonly el: Element;
	public readonly id: number;
	private readonly loadPromise: Promise<any>;

	static create(el: Element) {
		return new PlaywireBoltEmbed(el, ++this._nextId);
	}

	constructor(el: Element, id: number) {
		this.el = el;
		this.id = id;
		this.loadPromise = new Promise((resolve, reject) => {
			const dataset = {} as DOMStringMap;
			dataset.config = 'https://config.playwire.com/1391/playlists/v2/4898/zeus.json';
			dataset.autoload = 'true';
			dataset.id = this.datasetId;

			const readyFuncName = `_playwireBoltReady_${this.id}`;
			// (window as any).BoltDebugMode = true;
			(window as any)[readyFuncName] = () => {
				Console.debug('Resolving script');
				delete (window as any)[readyFuncName];
				resolve();
			};
			dataset.onready = readyFuncName;

			Console.debug(`Loading script ${this.id}`);
			loadScript('https://cdn.playwire.com/bolt/js/zeus/embed.js', {
				element: this.el,
				dataset,
			})
				.then(() => {
					Console.debug('Bolt script finished loading');
				})
				.catch(e => {
					Console.debug('Bolt script failed to load: ' + e.message);
					delete (window as any)[readyFuncName];
					reject(e);
				});
		});
	}

	get datasetId() {
		return `playwireVideo${this.id}`;
	}

	async render() {
		Console.debug(`Waiting for Bolt before render ${this.id}`);
		await this.loadPromise;
		Console.debug('Rendering player');
		window.Bolt.renderPlayer(this.datasetId);
	}

	async destroy() {
		Console.debug(`Waiting for Bolt before destroy ${this.id}`);
		await this.loadPromise;
		Console.debug('Destroying player');
		window.Bolt.removeVideo(this.datasetId);
	}
}
