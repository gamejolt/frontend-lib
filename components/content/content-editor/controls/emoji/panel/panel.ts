import View from '!view!./panel.html?style=./panel.styl';
import { GJ_EMOJIS } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/gj-emoji-nodespec';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { NodeType } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@View
@Component({
	directives: {
		AppTooltip,
	},
})
export class AppContentEditorControlsEmojiPanel extends Vue {
	@Prop(EditorView)
	view!: EditorView;
	@Prop(Number)
	stateCounter!: number;

	top = '0px';
	emoji = 'huh'; // gets set to a random one at mounted
	panelVisible = false;
	visible = false;

	clickedWithPanelVisible = false;

	$refs!: {
		panel: HTMLElement;
		container: HTMLElement;
	};

	get spanClass() {
		let className = 'emoji emoji-' + this.emoji;
		if (this.panelVisible) {
			className += ' emoji-button-active';
		}
		return className;
	}

	get emojis() {
		return GJ_EMOJIS;
	}

	@Watch('stateCounter')
	private update() {
		if (this.view instanceof EditorView && this.canInsertEmoji()) {
			this.visible = true;

			const start = this.view.coordsAtPos(this.view.state.selection.from);
			const box = this.$refs.container.offsetParent.getBoundingClientRect();
			this.top = start.top - box.top + 'px';
			return;
		} else {
			this.visible = false;
		}
	}

	private setRandomEmoji() {
		const prev = this.emoji;
		do {
			const emojiIndex = Math.floor(Math.random() * GJ_EMOJIS.length);
			this.emoji = GJ_EMOJIS[emojiIndex];
		} while (prev === this.emoji);
	}

	mounted() {
		this.setRandomEmoji();
		this.update();
	}

	onMouseEnter() {
		if (!this.panelVisible) {
			this.setRandomEmoji();
		}
	}

	onMouseDown() {
		this.clickedWithPanelVisible = this.panelVisible;
	}

	async onButtonClick() {
		if (this.clickedWithPanelVisible) {
			this.panelVisible = false;
		} else {
			this.panelVisible = true;
			await Vue.nextTick();
			this.$refs.panel.focus();
		}
	}

	onPanelFocus() {
		this.panelVisible = true;
	}

	onPanelBlur() {
		this.panelVisible = false;
	}

	private canInsertEmoji() {
		const emojiNodeType = this.view.state.schema.nodes.gjEmoji as NodeType;
		const { $from } = this.view.state.selection;
		const index = $from.index();
		return $from.parent.canReplaceWith(index, index, emojiNodeType);
	}

	onClickEmoji(emojiType: string) {
		const emojiNodeType = this.view.state.schema.nodes.gjEmoji as NodeType;

		if (this.canInsertEmoji()) {
			const tr = this.view.state.tr;
			tr.replaceSelectionWith(emojiNodeType.create({ type: emojiType }));
			this.view.dispatch(tr);
			this.view.focus();
		}
	}
}
