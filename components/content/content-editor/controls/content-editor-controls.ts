import View from '!view!./content-editor-controls.html?style=./content-editor-controls.styl';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { Node, NodeType } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { ContextCapabilities } from '../../content-context';

@View
@Component({
	components: {},
	directives: {
		AppTooltip,
	},
})
export class AppContentEditorControls extends Vue {
	@Prop(Object)
	view!: EditorView;
	@Prop(Number)
	stateCounter!: number;
	@Prop(Object)
	capabilities!: ContextCapabilities;

	visible = true;
	top = '0px';
	right = '0px';

	$refs!: {
		container: HTMLElement;
	};

	get visibility() {
		if (!this.visible) {
			return 'hidden';
		} else {
			return 'visible';
		}
	}

	private getSelectedNode(view: EditorView) {
		let selFrom = view.state.selection.from;
		let node = view.state.doc.nodeAt(selFrom);
		if (node === null && selFrom > 0) {
			selFrom--;
			node = view.state.doc.nodeAt(selFrom);
		}
		if (node === undefined) {
			return null;
		}
		return node;
	}

	mounted() {
		this.update();
	}

	@Watch('stateCounter')
	private update() {
		if (this.view instanceof EditorView) {
			const state = this.view.state;
			const node = this.getSelectedNode(this.view);

			if (node !== null) {
				switch (node.type.name) {
					case 'paragraph':
						if (state.selection.empty) {
							this.visible = true;

							const start = this.view.coordsAtPos(state.selection.from);
							const box = this.$refs.container.offsetParent.getBoundingClientRect();
							this.top = start.top - box.top - 8 + 'px';
							this.right = '16px';
						}
						break;
					default:
						this.visible = false;
						break;
				}
			} else {
				this.visible = false;
			}
		} else {
			this.visible = false;
		}
	}

	onClickScreenshot() {
		const tr = this.view.state.tr;
		const selection = this.view.state.selection;
		const from = selection.from;

		const newImageNode = this.view.state.schema.nodes.img.create() as Node;
		tr.insert(from - 1, newImageNode);

		this.view.focus();
		this.view.dispatch(tr);
	}

	onClickVideo() {
		const tr = this.view.state.tr;
		const selection = this.view.state.selection;
		const from = selection.from;

		const newVideoNode = (this.view.state.schema.nodes.embed as NodeType).create({
			embedType: 'youtube-video',
			// embedSource: 'test',
		}) as Node;
		tr.insert(from - 1, newVideoNode);

		this.view.focus();
		this.view.dispatch(tr);
	}
}
