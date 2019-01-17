import View from '!view!./text-controls.html?style=./text-controls.styl';
import { ContextCapabilities } from 'game-jolt-frontend-lib/components/content/content-context';
import { ContentEditorService } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.service';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { toggleMark } from 'prosemirror-commands';
import { MarkType } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
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

	visible = false;
	left = '0px';
	bottom = '0px';

	$refs!: {
		container: HTMLElement;
	};

	mounted() {
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
						this.visible = true;
						// Wait here so the buttons don't jump into place weirdly.
						await Vue.nextTick();

						const { from, to } = state.selection;
						const start = this.view.coordsAtPos(from);
						const end = this.view.coordsAtPos(to);
						const box = this.$refs.container.offsetParent.getBoundingClientRect();

						const left =
							Math.max((start.left + end.left) / 2, start.left + 3) -
							this.$refs.container.clientWidth / 2;
						this.left = left - box.left + 'px';
						this.bottom = box.bottom - start.top + 4 + 'px';
						return;
					}
				}
			}
		}

		this.visible = false;
	}

	private dispatchMark(mark: MarkType, attrs?: { [key: string]: any }) {
		toggleMark(mark, attrs)(this.view.state, tr => {
			this.view.dispatch(tr);
		});
	}

	onClickBold() {
		this.dispatchMark(this.view.state.schema.marks.strong);
	}

	onClickItalic() {
		this.dispatchMark(this.view.state.schema.marks.em);
	}

	onClickStrikethrough() {
		this.dispatchMark(this.view.state.schema.marks.strike);
	}

	onClickCode() {
		this.dispatchMark(this.view.state.schema.marks.code);
	}

	async onClickLink() {
		const result = await ContentEditorLinkModal.show();
		if (result) {
			this.dispatchMark(this.view.state.schema.marks.link, {
				href: result.href,
				title: result.title,
			});
		}
	}
}
