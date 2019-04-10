import { ContentEditorService } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.service';
import { GJ_EMOJIS } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/gj-emoji-nodespec';
import AppPopper from 'game-jolt-frontend-lib/components/popper/popper.vue';
import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({
	components: {
		AppPopper,
	},
})
export default class AppContentEditorEmojiControls extends Vue {
	@Prop(Object)
	view!: EditorView;
	@Prop(Number)
	stateCounter!: number;

	visible = true;
	left = '0px';
	bottom = '0px';

	$refs!: {
		container: HTMLElement;
	};

	get emojis() {
		return GJ_EMOJIS;
	}

	onHidePopper() {
		this.visible = false;
		this.$emit('hide');
	}

	mounted() {
		this.visible = true;
		this.update();
	}

	@Watch('stateCounter')
	private async update() {
		if (this.view instanceof EditorView) {
			const state = this.view.state;

			const node = ContentEditorService.getSelectedNode(this.view.state);

			if (node !== null && (node.type.name === 'text' || node.type.name === 'paragraph')) {
				this.visible = true;

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

		this.visible = false;
	}

	onClickEmoji(emojiType: string) {
		const emojiNodeType = this.view.state.schema.nodes.gjEmoji;

		const { $from } = this.view.state.selection;
		const index = $from.index();
		if ($from.parent.canReplaceWith(index, index, emojiNodeType)) {
			const tr = this.view.state.tr;
			tr.replaceSelectionWith(emojiNodeType.create({ type: emojiType }));
			this.view.dispatch(tr);

			this.onHidePopper();
		}
	}
}
