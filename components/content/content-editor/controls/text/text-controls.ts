import View from '!view!./text-controls.html?style=./text-controls.styl';
import { ContextCapabilities } from 'game-jolt-frontend-lib/components/content/content-context';
import { ContentEditorService } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.service';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { lift, toggleMark, wrapIn } from 'prosemirror-commands';
import { Mark, MarkType, Node, NodeType } from 'prosemirror-model';
import { liftListItem, wrapInList } from 'prosemirror-schema-list';
import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { MouseState } from '../../../../../utils/mouse';
import { ContentEditorLinkModal } from '../../modals/link/link-modal.service';

@View
@Component({
	directives: {
		AppTooltip,
	},
})
export class AppContentEditorTextControls extends Vue {
	@Prop(Object)
	view!: EditorView;
	@Prop(Number)
	stateCounter!: number;
	@Prop(Object)
	capabilities!: ContextCapabilities;

	// CSS and styling
	visible = false;
	left = '0px';
	bottom = '0px';

	// State
	isShowingOnMouseUp = false;
	mouse: MouseState | null = null;
	selectionMarks: Mark[] = [];
	canLiftListItems = false;
	canWrapInLists = false;
	isInSpoiler = false;
	isInHeading = false;
	headingLevel = -1;

	$refs!: {
		container: HTMLElement;
	};

	get shouldShowSpoiler() {
		return this.capabilities.spoiler && (this.isInSpoiler || this.testWrapSpoiler());
	}

	@Emit('click')
	emitClicked() {}

	mounted() {
		this.mouse = new MouseState();
		this.update();
	}

	@Watch('stateCounter')
	private async update() {
		if (this.view instanceof EditorView) {
			const state = this.view.state;

			if (!state.selection.empty) {
				const node = ContentEditorService.getSelectedNode(this.view.state);

				if (
					node !== null &&
					(node.type.name === 'text' || node.type.name === 'paragraph')
				) {
					const parent = ContentEditorService.getParentNode(this.view.state, node);

					// Make sure that marks can be applied to the parent of this text
					if (parent && parent.type.spec.marks !== '') {
						this.selectionMarks = ContentEditorService.getSelectionMarks(
							this.view.state
						);
						this.canLiftListItems = this.testLiftListItems();
						// Bullet list has the same rules as ordered list
						this.canWrapInLists = this.testWrapInList(
							this.view.state.schema.nodes.bulletList
						);
						// Find if this node is inside a spoiler
						this.isInSpoiler = this.testIsInSpoiler(node) instanceof Node;
						// Find the parent heading level
						const headingParentNode = this.testIsInHeading(node);
						if (headingParentNode) {
							this.isInHeading = true;
							this.headingLevel = headingParentNode.attrs.level;
						} else {
							this.isInHeading = false;
							this.headingLevel = -1;
						}

						// When the controls are already visible, just adjust their position
						// This also applies for when we are waiting for the mouse button to be released

						// When the mouse button is down and the controls aren't showing, we want to wait before
						// showing them. Otherwise, when moving the selection upwards, the controls can get in the way
						if (this.visible || this.isShowingOnMouseUp) {
							this.setPosition();
							return;
						}

						if (this.mouse!.isButtonDown('left')) {
							document.addEventListener('mouseup', this.mouseUpHandler);
							this.isShowingOnMouseUp = true;
						} else {
							this.show();
						}

						return;
					}
				}
			}
		}

		this.visible = false;
	}

	private mouseUpHandler(e: MouseEvent) {
		if (e.button === 0) {
			document.removeEventListener('mouseup', this.mouseUpHandler);
			this.isShowingOnMouseUp = false;
			this.show();
		}
	}

	private async show() {
		this.visible = true;
		// Wait here so the buttons don't jump into place weirdly.
		await Vue.nextTick();

		this.setPosition();
	}

	private setPosition() {
		const { from, to } = this.view.state.selection;
		const start = this.view.coordsAtPos(from);
		const end = this.view.coordsAtPos(to);
		const box = this.$refs.container.offsetParent.getBoundingClientRect();

		const left =
			Math.max((start.left + end.left) / 2, start.left + 3) -
			this.$refs.container.clientWidth / 2;
		this.left = left - box.left + 'px';
		this.bottom = box.bottom - start.top + 4 + 'px';
	}

	private hasMark(markType: string) {
		return this.selectionMarks.some(m => m.type.name === markType);
	}

	private dispatchMark(mark: MarkType, attrs?: { [key: string]: any }) {
		toggleMark(mark, attrs)(this.view.state, tr => {
			this.view.dispatch(tr);
		});
	}

	onClickBold() {
		this.dispatchMark(this.view.state.schema.marks.strong);
		this.emitClicked();
	}

	onClickItalic() {
		this.dispatchMark(this.view.state.schema.marks.em);
		this.emitClicked();
	}

	onClickStrikethrough() {
		this.dispatchMark(this.view.state.schema.marks.strike);
		this.emitClicked();
	}

	onClickCode() {
		this.dispatchMark(this.view.state.schema.marks.code);
		this.emitClicked();
	}

	async onClickLink() {
		if (this.hasMark('link')) {
			// Remove the link mark
			this.dispatchMark(this.view.state.schema.marks.link);
		} else {
			const result = await ContentEditorLinkModal.show();
			if (result) {
				this.dispatchMark(this.view.state.schema.marks.link, {
					href: result.href,
					title: result.title,
				});
			}
		}
		this.emitClicked();
	}

	testWrapInList(listType: NodeType) {
		return wrapInList(listType)(this.view.state);
	}

	doWrapInList(listType: NodeType) {
		wrapInList(listType)(this.view.state, this.view.dispatch);
		ContentEditorService.ensureEndNode(this.view, this.view.state.schema.nodes.paragraph);
	}

	testLiftListItems() {
		return liftListItem(this.view.state.schema.nodes.listItem)(this.view.state);
	}

	doLiftListItems() {
		liftListItem(this.view.state.schema.nodes.listItem)(this.view.state, this.view.dispatch);
		this.emitClicked();
	}

	onClickBulletList() {
		if (this.testLiftListItems()) {
			this.doLiftListItems();
		} else {
			this.doWrapInList(this.view.state.schema.nodes.bulletList);
			this.emitClicked();
		}
	}

	onClickOrderedList() {
		if (this.testLiftListItems()) {
			this.doLiftListItems();
		} else {
			this.doWrapInList(this.view.state.schema.nodes.orderedList);
			this.emitClicked();
		}
	}

	testWrapSpoiler() {
		return wrapIn(this.view.state.schema.nodes.spoiler)(this.view.state);
	}

	doWrapInSpoiler() {
		wrapIn(this.view.state.schema.nodes.spoiler)(this.view.state, this.view.dispatch);
	}

	testIsInSpoiler(node: Node) {
		return ContentEditorService.isContainedInNode(
			this.view.state,
			node,
			this.view.state.schema.nodes.spoiler
		);
	}

	onClickSpoiler() {
		if (this.isInSpoiler) {
			const node = ContentEditorService.getSelectedNode(this.view.state);
			if (node !== null) {
				let lifted;
				do {
					lifted = lift(this.view.state, this.view.dispatch);
				} while (lifted && this.testIsInSpoiler(node));
			}
		} else {
			this.doWrapInSpoiler();
			ContentEditorService.ensureEndNode(this.view, this.view.state.schema.nodes.paragraph);
		}
		this.emitClicked();
	}

	testWrapInHeading() {
		return wrapIn(this.view.state.schema.nodes.heading, { level: 1 })(this.view.state);
	}

	testIsInHeading(node: Node) {
		return ContentEditorService.isContainedInNode(
			this.view.state,
			node,
			this.view.state.schema.nodes.heading
		);
	}

	liftFromHeading() {
		const node = ContentEditorService.getSelectedNode(this.view.state);
		if (node !== null) {
			let lifted;
			do {
				lifted = lift(this.view.state, this.view.dispatch);
			} while (lifted && this.testIsInHeading(node));
		}
		this.emitClicked();
	}

	doWrapInHeading(level: number) {
		wrapIn(this.view.state.schema.nodes.heading, { level })(
			this.view.state,
			this.view.dispatch
		);
	}

	onClickHeading(level: number) {
		this.doWrapInHeading(level);
		ContentEditorService.ensureEndNode(this.view, this.view.state.schema.nodes.paragraph);
		this.emitClicked();
	}
}
