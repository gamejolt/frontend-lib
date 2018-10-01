import { EventItem } from 'game-jolt-frontend-lib/components/event-item/event-item.model';
import { appStore } from '../../../vue/services/app/app-store';
import { Api } from '../../api/api.service';
import { Game } from '../../game/game.model';
import { HistoryTick } from '../../history-tick/history-tick-service';
import { KeyGroup } from '../../key-group/key-group.model';
import { MediaItem } from '../../media-item/media-item-model';
import { ModalConfirm } from '../../modal/confirm/confirm-service';
import { Model, ModelSaveRequestOptions } from '../../model/model.service';
import { Poll } from '../../poll/poll.model';
import { Registry } from '../../registry/registry.service';
import { Translate } from '../../translate/translate.service';
import { User } from '../../user/user.model';
import { FiresidePostLike } from './like/like-model';
import { FiresidePostSketchfab } from './sketchfab/sketchfab-model';
import { FiresidePostTag } from './tag/tag-model';
import { FiresidePostVideo } from './video/video-model';

export function canUserManagePost(post: FiresidePost, user: User | undefined | null) {
	if (!user) {
		return false;
	}

	if (post.user.id === user.id) {
		return true;
	}

	if (post.game && post.game.hasPerms('devlogs')) {
		return true;
	}

	return false;
}

export class FiresidePost extends Model {
	static TYPE_TEXT = 'text';
	static TYPE_MEDIA = 'media';
	static TYPE_VIDEO = 'video';
	static TYPE_SKETCHFAB = 'sketchfab';

	static STATUS_DRAFT = 'draft';
	static STATUS_ACTIVE = 'active';
	static STATUS_REMOVED = 'removed';

	type!: 'text' | 'media' | 'video' | 'sketchfab' | 'comment-video';
	hash!: string;
	lead!: string;
	lead_compiled!: string;
	lead_snippet!: string;
	header?: MediaItem;
	status!: string;
	added_on!: number;
	updated_on!: number;
	published_on!: number;
	scheduled_for_timezone!: string | null;
	scheduled_for!: number | null;
	like_count!: number;
	comment_count!: number;
	user!: User;
	game!: Game;
	as_game_owner!: boolean;
	slug!: string;
	subline!: string;
	url!: string;
	content_compiled!: string;
	content_markdown?: string;
	view_count?: number;
	expand_count?: number;
	publish_to_platforms!: string | null;

	tags: FiresidePostTag[] = [];
	media: MediaItem[] = [];
	videos: FiresidePostVideo[] = [];
	sketchfabs: FiresidePostSketchfab[] = [];
	user_like?: FiresidePostLike | null;
	key_groups: KeyGroup[] = [];
	poll!: Poll | null;

	// Used for forms and saving.
	key_group_ids: number[] = [];

	// Returned when saving a post for the first time.
	// The feed no longer works with posts directly - we need the event item.
	event_item?: EventItem;

	constructor(data: any = {}) {
		super(data);

		if (data.header) {
			this.header = new MediaItem(data.header);
		}

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.game) {
			this.game = new Game(data.game);
		}

		if (data.tags) {
			this.tags = FiresidePostTag.populate(data.tags);
		}

		if (data.media) {
			this.media = MediaItem.populate(data.media);
		}

		if (data.videos) {
			this.videos = FiresidePostVideo.populate(data.videos);
		}

		if (data.sketchfabs) {
			this.sketchfabs = FiresidePostSketchfab.populate(data.sketchfabs);
		}

		if (data.user_like) {
			this.user_like = new FiresidePostLike(data.user_like);
		}

		if (data.key_groups) {
			this.key_groups = KeyGroup.populate(data.key_groups);
			this.key_group_ids = this.key_groups.map(i => i.id);
		}

		if (data.poll) {
			this.poll = new Poll(data.poll);
		}

		if (data.event_item) {
			this.event_item = new EventItem(data.event_item);
		}

		Registry.store('FiresidePost', this);
	}

	get isActive() {
		return this.status === FiresidePost.STATUS_ACTIVE;
	}

	get isDraft() {
		return this.status === FiresidePost.STATUS_DRAFT;
	}

	get isScheduled() {
		return !!this.scheduled_for;
	}

	get hasMedia() {
		return this.media.length > 0;
	}

	get hasSketchfab() {
		return this.sketchfabs.length > 0;
	}

	get hasVideo() {
		return this.videos.length > 0;
	}

	get hasArticle() {
		return !!this.content_compiled;
	}

	get hasPoll() {
		return !!this.poll;
	}

	static pullHashFromUrl(url: string) {
		return url.substring(url.lastIndexOf('-') + 1);
	}

	async fetchLikes(): Promise<FiresidePostLike[]> {
		const response = await Api.sendRequest(`/web/posts/likes/${this.id}`);
		return FiresidePostLike.populate(response.likes);
	}

	static async $create(gameId?: number) {
		let url = `/web/posts/manage/new-post`;
		if (gameId) {
			url += '/' + gameId;
		}

		const response = await Api.sendRequest(url);
		await FiresidePost.processCreate(response, 'post');
		return new FiresidePost(response.post);
	}

	$save() {
		if (!this.id) {
			throw new Error(
				`Can't add fireside posts through $save() anymore. Use $create() instead`
			);
		}

		const options: ModelSaveRequestOptions = {
			data: Object.assign({}, this),
			allowComplexData: ['keyGroups', 'mediaItemIds'],
		};

		if (this.game) {
			options.data.keyGroups = {};
			for (const id of this.key_group_ids) {
				options.data.keyGroups[id] = true;
			}
		}

		return this.$_save(`/web/posts/manage/save/${this.id}`, 'firesidePost', options);
	}

	$viewed() {
		// TODO(collaborators) block collaborators from logging ticks on posts they own
		if (!appStore.state.user || this.user.id !== appStore.state.user.id) {
			HistoryTick.sendBeacon('fireside-post', this.id);
		}
	}

	$expanded() {
		// TODO(collaborators) block collaborators from logging ticks on posts they own
		if (!appStore.state.user || this.user.id !== appStore.state.user.id) {
			HistoryTick.sendBeacon('fireside-post-expand', this.id);
		}
	}

	$publish() {
		return this.$_save(`/web/posts/manage/publish/${this.id}`, 'firesidePost');
	}

	async remove() {
		const result = await ModalConfirm.show(
			Translate.$gettext(`Are you sure you want to remove this post?`),
			undefined,
			'yes'
		);

		if (result) {
			await this.$remove();
			return true;
		}

		return false;
	}

	$remove() {
		return this.$_remove(`/web/posts/manage/remove/${this.id}`);
	}
}

Model.create(FiresidePost);
