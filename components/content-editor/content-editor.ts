import Vue, { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { ContentEditorNodeParagraphModel } from './node/paragraph.model';
import { ContentEditorSpanBold } from './span/bold';
import { ContentEditorSpanItalic } from './span/italic';
import { AppContentBlockEditorNodeParagraph } from './node/paragraph';
import { ContentEditorSpanLink } from './span/link';
import { ContentEditorNodeHeadingModel } from './node/heading.model';
import { AppContentBlockEditorNodeHeading } from './node/heading';
import { DomObserver } from './dom-observer';
import { ContentEditorNode } from './node/index';

@Component({})
export class AppContentEditor extends Vue {
	private observer: DomObserver;

	private nodes: ContentEditorNode[] = [
		new ContentEditorNodeHeadingModel('This is a heading', []),
		new ContentEditorNodeParagraphModel('Testing this out', [
			new ContentEditorSpanItalic(0, 12),
			new ContentEditorSpanBold(8, 16),
			new ContentEditorSpanLink(8, 12, 'https://gamejolt.com'),
			new ContentEditorSpanBold(0, 2),
		]),
	];

	mounted() {
		// Make paragraphs consistently.
		document.execCommand('defaultParagraphSeparator', false, 'p');
		this.observer = new DomObserver(this.$el, nodes => this.syncNodes(nodes));
	}

	destroyed() {
		this.observer.disconnect();
	}

	async syncNodes(nodes: ContentEditorNode[]) {
		this.observer.pause();
		this.nodes = nodes;
		await this.$nextTick();
		this.observer.resume();
	}

	getNodeComponent(node: any) {
		if (node instanceof ContentEditorNodeParagraphModel) {
			return AppContentBlockEditorNodeParagraph;
		} else if (node instanceof ContentEditorNodeHeadingModel) {
			return AppContentBlockEditorNodeHeading;
		}
		console.error(node);
		throw new Error(`Invalid node type.`);
	}

	onKeypress(e: KeyboardEvent) {
		if (e.keyCode === 13) {
			e.preventDefault();
			this.nodes.push(new ContentEditorNodeParagraphModel('', []));
		}
	}

	render(h: CreateElement) {
		let i = 0;
		const nodes = this.nodes.map(node =>
			h(this.getNodeComponent(node), { key: ++i, props: { node } })
		);
		console.log('rendering again', nodes);

		return h(
			'div',
			{
				on: {
					keypress: (e: KeyboardEvent) => this.onKeypress(e),
				},
				attrs: {
					class: 'fireside-post-body',
					contenteditable: true,
				},
				directives: [
					{
						name: 'shortkey',
						modifiers: { avoid: true },
					},
				] as any,
			},
			nodes
		);
	}
}
