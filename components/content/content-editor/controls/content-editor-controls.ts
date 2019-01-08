import View from '!view!./content-editor-controls.html?style=./content-editor-controls.styl';
import { ContentEditorService } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.service';
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
	collapsed = true;

	$refs!: {
		container: HTMLElement;
	};

	mounted() {
		this.update();
	}

	@Watch('stateCounter')
	private update() {
		if (this.view instanceof EditorView) {
			const state = this.view.state;
			const node = ContentEditorService.getSelectedNode(this.view.state);

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
						this.collapsed = true;
						break;
				}
			} else {
				this.visible = false;
				this.collapsed = true;
			}
		} else {
			this.visible = false;
			this.collapsed = true;
		}
	}

	onClickExpand() {
		this.collapsed = !this.collapsed;
	}

	private insertNewNode(newNode: Node) {
		const tr = this.view.state.tr;
		const selection = this.view.state.selection;
		const from = selection.from;

		tr.insert(from - 1, newNode);

		this.view.focus();
		this.view.dispatch(tr);

		this.collapsed = true;
	}

	onClickScreenshot() {
		const newNode = this.view.state.schema.nodes.img.create() as Node;
		this.insertNewNode(newNode);
	}

	onClickVideo() {
		const newNode = (this.view.state.schema.nodes.embed as NodeType).create({
			embedType: 'youtube-video',
			// embedSource: 'test',
		}) as Node;
		this.insertNewNode(newNode);
	}

	onClickSoundCloudSong() {
		const newNode = (this.view.state.schema.nodes.embed as NodeType).create({
			embedType: 'soundcloud-song',
			embedSource: '41863748',
		}) as Node;
		this.insertNewNode(newNode);
	}
}
