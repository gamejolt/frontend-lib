import { parseDomToNodes } from './dom-parser';
import { ContentEditorNode } from './node/index';

const ObserveOptions = {
	childList: true,
	characterData: true,
	attributes: true,
	subtree: true,
	characterDataOldValue: true,
};

export class DomObserver {
	private observer: MutationObserver;
	private isPaused = false;

	constructor(private el: HTMLElement, private cb: (nodes: ContentEditorNode[]) => void) {
		this.observer = new MutationObserver(mutations => this.onMutations(mutations));
		this.observer.observe(this.el, ObserveOptions);
	}

	onMutations(mutations: MutationRecord[]) {
		if (this.isPaused) {
			return;
		}
		// console.log(mutations);

		// for (const mutation of mutations) {
		// 	if (mutation.type === 'childList') {
		// 		console.log('A child node has been added or removed.');
		// 	} else if (mutation.type === 'attributes') {
		// 		console.log('The ' + mutation.attributeName + ' attribute was modified.');
		// 	}
		// }

		const nodes = parseDomToNodes(this.el.childNodes);
		console.log('parsed nodes', nodes);
		this.cb(nodes);
	}

	pause() {
		this.isPaused = true;
	}

	resume() {
		this.isPaused = false;
	}

	disconnect() {
		this.observer.disconnect();
	}
}
