import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { numberSort } from '../../../../../../utils/array';
import AppScrollScroller from '../../../../../scroll/scroller/scroller.vue';
import AppUserAvatarImg from '../../../../../user/user-avatar/img/img.vue';
import { User } from '../../../../../user/user.model';
import AppUserVerifiedTick from '../../../../../user/verified-tick/verified-tick.vue';
import { MentionCache } from '../../../../mention-cache';
import { ContentEditorService } from '../../../content-editor.service';
import { ContentEditorSchema } from '../../../schemas/content-editor-schema';

@Component({
	components: {
		AppUserAvatarImg,
		AppUserVerifiedTick,
		AppScrollScroller,
	},
})
export default class AppContentEditorControlsMentionAutocompleteControls extends Vue {
	@Prop(Object)
	view!: EditorView<ContentEditorSchema>;
	@Prop(Number)
	stateCounter!: number;

	suggestion = '';
	users: User[] = [];
	visible = false;
	top = '0px';
	selectedIndex = 0;

	readonly Screen = Screen;

	$refs!: {
		container: HTMLElement;
	};

	mounted() {
		this.update();
		document.addEventListener('keydown', this.onKeyDown);
	}

	@Watch('stateCounter')
	private update() {
		if (this.view instanceof EditorView) {
			const state = this.view.state;
			const node = ContentEditorService.getSelectedNode(this.view.state);

			if (node !== null && node.isText) {
				const slice = state.doc.slice(0, state.selection.to);
				const text = ContentEditorService.getFragmentText(slice.content);
				const matches = /@([\w_-]+)$/i.exec(text);

				if (matches && matches.length >= 2) {
					this.suggestion = matches[1];
					this.updateSuggestions(this.suggestion);
					this.visible = true;

					const start = this.view.coordsAtPos(state.selection.from);

					const box = this.$refs.container.offsetParent.getBoundingClientRect();
					this.top = start.top - box.top + 24 + 'px';

					return;
				}
			}
		}
		this.visible = false;
	}

	private updateSuggestions(suggestion: string) {
		this.users = MentionCache.getUsers(suggestion)
			.sort((a, b) => numberSort(b.rank, a.rank))
			.map(i => i.user);
		this.selectedIndex = 0;
	}

	isSelected(userId: number) {
		return this.users[this.selectedIndex].id === userId;
	}

	async onKeyDown(e: KeyboardEvent) {
		if (this.visible) {
			if (e.key === 'ArrowDown' && this.selectedIndex < this.users.length - 1) {
				this.selectedIndex++;
				e.stopPropagation();
				e.preventDefault();
			} else if (e.key === 'ArrowUp' && this.selectedIndex > 0) {
				this.selectedIndex--;
				e.stopPropagation();
				e.preventDefault();
			}
		}
	}
}
