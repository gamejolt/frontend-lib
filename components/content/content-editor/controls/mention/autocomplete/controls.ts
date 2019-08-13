import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { numberSort } from '../../../../../../utils/array';
import AppLoading from '../../../../../../vue/components/loading/loading.vue';
import { Screen } from '../../../../../screen/screen-service';
import AppScrollScroller from '../../../../../scroll/scroller/scroller.vue';
import AppUserAvatarImg from '../../../../../user/user-avatar/img/img.vue';
import { User } from '../../../../../user/user.model';
import AppUserVerifiedTick from '../../../../../user/verified-tick/verified-tick.vue';
import { MentionCache, MentionCacheUser } from '../../../../mention-cache';
import { ContentEditorService } from '../../../content-editor.service';
import { ContentEditorSchema } from '../../../schemas/content-editor-schema';

@Component({
	components: {
		AppUserAvatarImg,
		AppUserVerifiedTick,
		AppScrollScroller,
		AppLoading,
	},
})
export default class AppContentEditorControlsMentionAutocompleteControls extends Vue {
	@Prop(Object)
	view!: EditorView<ContentEditorSchema>;
	@Prop(Number)
	stateCounter!: number;
	@Prop(Number)
	canShow!: number;

	// We cache prior search results so we don't need to query backend again.
	private static searchResults: { [k: string]: User[] } = {};

	suggestion = ''; // Currently active suggestion.
	users: MentionCacheUser[] = [];
	visible = false;
	top = 'auto';
	bottom = 'auto';
	left = 'auto';

	selectedIndex = 0;
	isListening = false; // If we are listening to the document keydown event, to be able to unbind it later.
	inverted = false; // If the list is inverted due to screen size constraints. It shows above the control instead of below.
	remoteSuggestionTimeout?: NodeJS.Timer; // Timeout between requests to search backend
	isLoading = false; // Loading more users from backend

	readonly Screen = Screen;

	$refs!: {
		container: HTMLElement;
		list: HTMLDivElement;
	};

	get displayUsers() {
		if (this.inverted) {
			return this.users.reverse();
		}
		return this.users;
	}

	get searchResultsCache() {
		// just a shorthand
		return AppContentEditorControlsMentionAutocompleteControls.searchResults;
	}

	mounted() {
		this.update();
		document.addEventListener('keydown', this.onKeyDown);
		this.isListening = true;
	}

	destroyed() {
		if (this.isListening) {
			document.removeEventListener('keydown', this.onKeyDown);
			this.isListening = false;
		}
	}

	@Watch('canShow')
	@Watch('stateCounter')
	private update() {
		if (this.canShow && this.view instanceof EditorView) {
			const state = this.view.state;
			const node = ContentEditorService.getSelectedNode(this.view.state);

			if (node !== null && node.isText) {
				const slice = state.doc.slice(0, state.selection.from);
				const text = ContentEditorService.getFragmentText(slice.content);
				const matches = /@([\w_-]+)$/i.exec(text);

				if (matches && matches.length >= 2) {
					const start = this.view.coordsAtPos(state.selection.from);

					const box = this.$refs.container.offsetParent.getBoundingClientRect();

					// If the text control is more than 50% down the page, open the control above ("inverted")
					const relativeYPos = box.top / Screen.height;
					if (relativeYPos >= 0.5) {
						this.inverted = true;
						this.top = 'auto';
						this.bottom = start.top - box.top + 30 + 'px';
					} else {
						this.inverted = false;
						this.top = start.top - box.top + 30 + 'px';
						this.bottom = 'auto';
					}

					if (this.Screen.isXs) {
						// On mobile, we want to position the element to the left border of the screen
						this.left = '-' + box.left + 'px';
					} else {
						this.left = 'auto';
					}

					this.suggestion = matches[1];
					this.updateSuggestions(this.suggestion);
					this.visible = true;

					return;
				}
			}
		}
		this.visible = false;
	}

	private async updateSuggestions(suggestion: string) {
		this.users = MentionCache.getUsers(this.$route, suggestion).sort((a, b) =>
			numberSort(b.match, a.match)
		);

		this.remoteSuggestions(suggestion);

		if (this.inverted) {
			this.selectedIndex = this.users.length - 1;

			// If we are inverted, wait for the list to render and then scroll to the bottom.
			await this.$nextTick();
			if (this.$refs.list) {
				this.$refs.list.scrollTop = this.$refs.list.scrollHeight;
			}
		} else {
			this.selectedIndex = 0;
		}
	}

	private remoteSuggestions(suggestion: string) {
		// Stop any existing queued search timeout.
		if (this.remoteSuggestionTimeout) {
			clearTimeout(this.remoteSuggestionTimeout);
			this.remoteSuggestionTimeout = undefined;
			this.isLoading = false;
		}

		// If we already have the search results cached, use those and don't query backend.
		if (this.searchResultsCache[suggestion]) {
			const searchUsers = this.searchResultsCache[suggestion];
			this.processSearchUsers(searchUsers);
		} else {
			// We set a timeout for 200ms here to not send right away when the user is typing fast.
			this.remoteSuggestionTimeout = setTimeout(async () => {
				this.isLoading = true;

				const payload = await Api.sendRequest(
					'/web/search/mention-suggestions?q=' + encodeURIComponent(suggestion),
					undefined,
					{ detach: true }
				);

				if (payload.users) {
					const searchUsers = User.populate(payload.users);

					// Add to cache
					if (!this.searchResultsCache[suggestion]) {
						this.searchResultsCache[suggestion] = searchUsers;
					}

					// Only process results if the currently active suggestion is still the one we initiated the search with.
					if (suggestion === this.suggestion) {
						this.processSearchUsers(searchUsers);
					}
				}

				this.isLoading = false;
			}, 200);
		}
	}

	private processSearchUsers(searchUsers: User[]) {
		let newUserCount = 0;
		for (const searchUser of searchUsers) {
			const existingUser = this.users.find(i => i.user.id === searchUser.id);
			// If the user already exists in the results, increase their match ranking.
			if (existingUser) {
				existingUser.match++;
			} else {
				const newUser = { user: searchUser, rank: 0, match: 0, source: 'search' };
				newUser.match = MentionCache.calculateUserMatch(this.suggestion, newUser);
				this.users.push(newUser);
				// Push down the selected index in inverted since we append at the end.
				if (this.inverted) {
					newUserCount++;
				}
			}
		}
		// Sort after inserting
		this.users = this.users.sort((a, b) => numberSort(b.match, a.match));

		this.selectedIndex += newUserCount;
	}

	isSelected(userId: number) {
		return this.users[this.selectedIndex].user.id === userId;
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
			} else if (e.key === 'Enter' || e.key === 'Tab') {
				const userToInsert = this.users[this.selectedIndex];
				if (userToInsert && userToInsert.user) {
					e.stopPropagation();
					e.preventDefault();
					this.insertUser(userToInsert.user);
				}
			}
		}
	}

	onClickInsert(user: User) {
		this.insertUser(user);
	}

	insertUser(user: User) {
		if (this.visible && this.canShow) {
			// start - end include the @suggestion text, it gets replaced with the insertText call.
			const start = this.view.state.selection.from - this.suggestion.length - 1;
			const end = this.view.state.selection.from;

			const tr = this.view.state.tr;
			tr.insertText('@' + user.username + ' ', start, end); // Add space to the end.
			this.view.dispatch(tr);

			this.$emit('insert', user);
		}
	}
}
