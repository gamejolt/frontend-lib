import {
	BaseNodeView,
	GetPosFunction,
} from 'game-jolt-frontend-lib/components/content/content-editor/node-views/base';
import { AppVideoEmbed } from 'game-jolt-frontend-lib/components/video/embed/embed';
import { Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

export class VideoView extends BaseNodeView {
	private insertedComponent = false;

	constructor(node: Node, view: EditorView, getPos: GetPosFunction) {
		super(node, view, getPos);

		this.dom.style.backgroundColor = 'transparent';
		this.dom.style.width = '640px';
		this.dom.style.height = '360px';
		this.dom.style.background = `url(${this.node.attrs.thumbnail})`;
		this.dom.style.backgroundSize = '100% 100%';
		this.dom.style.cursor = 'pointer';

		this.createVideoContainer();
	}

	createVideoContainer() {
		if (this.insertedComponent && this.dom.firstChild) {
			this.insertedComponent = false;
			this.dom.removeChild(this.dom.firstChild);
		}
		const container = document.createElement('div');
		container.id = 'videoContainer';
		container.style.display = 'flex';
		container.style.justifyContent = 'center';
		container.style.alignItems = 'center';
		container.style.flexDirection = 'column';
		container.style.height = '100%';

		const playIcon = document.createElement('span');
		playIcon.className = 'jolticon jolticon-play';
		playIcon.style.color = 'white';
		playIcon.style.fontSize = '64px';
		playIcon.style.cursor = 'pointer';
		container.appendChild(playIcon);

		const playText = document.createElement('span');
		playText.innerText = 'Play Video';
		playText.style.color = 'white';
		playText.style.fontSize = '24px';
		container.appendChild(playText);

		this.dom.appendChild(container);
	}

	selectNode() {
		if (!this.insertedComponent) {
			this.insertedComponent = true;
			const vm = new AppVideoEmbed({
				propsData: {
					videoProvider: this.node.attrs.videoProvider,
					videoId: this.node.attrs.videoId,
					autoplay: true,
				},
			});
			vm.$mount('#videoContainer');
		}
	}

	deselectNode() {
		if (this.insertedComponent) {
			this.createVideoContainer();
		}
	}
}
