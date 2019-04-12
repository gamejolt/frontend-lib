import { Node, NodeType } from 'prosemirror-model';
import { Selection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { AppTooltip } from '../../../../components/tooltip/tooltip';
import { ContextCapabilities } from '../../content-context';
import { ContentEditorService } from '../content-editor.service';
import { ContentTableService } from '../content-table.service';

@Component({
	components: {},
	directives: {
		AppTooltip,
	},
})
export default class AppContentEditorControls extends Vue {
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

			if (node !== null && node.type.name === 'paragraph' && state.selection.empty) {
				this.visible = true;

				const start = this.view.coordsAtPos(state.selection.from);

				// Offset the controls if there's a heading node.
				const headingNode = this.testIsInHeading(node);
				if (headingNode instanceof Node) {
					if (headingNode.attrs.level === 1) {
						start.top += 8;
					} else {
						start.top += 6;
					}
				}

				const box = this.$refs.container.offsetParent.getBoundingClientRect();
				this.top = start.top - box.top - 10 + 'px';
				this.left = '-32px';

				return;
			}
		}
		this.visible = false;
		this.setCollapsed(true);
	}

	testIsInHeading(node: Node) {
		if (!this.capabilities.heading) {
			return false;
		}
		return ContentEditorService.isContainedInNode(
			this.view.state,
			node,
			this.view.state.schema.nodes.heading
		);
	}

	private setCollapsed(value: boolean) {
		this.collapsed = value;
		this.$emit('collapsedChanged', value);
	}

	onClickExpand() {
		this.setCollapsed(!this.collapsed);
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

		this.setCollapsed(true);
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
