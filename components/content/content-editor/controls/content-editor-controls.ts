import View from '!view!./content-editor-controls.html?style=./content-editor-controls.styl';
import { ContentEditorService } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.service';
import { ContentTableService } from 'game-jolt-frontend-lib/components/content/content-editor/content-table.service';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { Node, NodeType } from 'prosemirror-model';
import { Selection } from 'prosemirror-state';
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

	visible = false;
	top = '0px';
	left = '0px';
	collapsed = true;

	readonly Screen = Screen;

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
							this.top = start.top - box.top - 10 + 'px';
							if (this.Screen.isXs) {
								this.left = '32px';
							} else {
								this.left = '-32px';
							}
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
		tr.replaceWith(
			this.view.state.selection.from - 1,
			this.view.state.selection.to + 1,
			newNode
		);

		const resolvedCursorPos = tr.doc.resolve(this.view.state.selection.from);
		const selection = Selection.near(resolvedCursorPos);
		tr.setSelection(selection);
		ContentEditorService.ensureEndNode(tr, this.view.state.schema.nodes.paragraph);

		this.view.focus();
		this.view.dispatch(tr);

		this.collapsed = true;
	}

	onClickMedia() {
		const newNode = (this.view.state.schema.nodes.mediaItem as NodeType).create({
			id: 61,
		});
		this.insertNewNode(newNode);
	}

	onClickEmbed() {
		const newNode = (this.view.state.schema.nodes.embed as NodeType).create();
		this.insertNewNode(newNode);
	}

	onClickCodeBlock() {
		const newNode = (this.view.state.schema.nodes.codeBlock as NodeType).create();
		this.insertNewNode(newNode);
	}

	onClickBlockquote() {
		const contentNode = (this.view.state.schema.nodes.paragraph as NodeType).create();
		const newNode = (this.view.state.schema.nodes.blockquote as NodeType).create(
			{},
			contentNode
		);
		this.insertNewNode(newNode);
	}

	onClickHr() {
		const newNode = (this.view.state.schema.nodes.hr as NodeType).create();
		this.insertNewNode(newNode);
	}

	onClickTable() {
		const newNode = ContentTableService.createNew(this.view.state.schema, 3, 2);
		this.insertNewNode(newNode);
	}

	onClickSpoiler() {
		const contentNode = (this.view.state.schema.nodes.paragraph as NodeType).create();
		const newNode = (this.view.state.schema.nodes.spoiler as NodeType).create({}, contentNode);
		this.insertNewNode(newNode);
	}

	onClickBulletList() {
		const contentNode = (this.view.state.schema.nodes.paragraph as NodeType).create();
		const listItemNode = (this.view.state.schema.nodes.listItem as NodeType).create(
			{},
			contentNode
		);
		const newNode = (this.view.state.schema.nodes.bulletList as NodeType).create(
			{},
			listItemNode
		);
		this.insertNewNode(newNode);
	}

	onClickOrderedList() {
		const contentNode = (this.view.state.schema.nodes.paragraph as NodeType).create();
		const listItemNode = (this.view.state.schema.nodes.listItem as NodeType).create(
			{},
			contentNode
		);
		const newNode = (this.view.state.schema.nodes.orderedList as NodeType).create(
			{},
			listItemNode
		);
		this.insertNewNode(newNode);
	}
}
