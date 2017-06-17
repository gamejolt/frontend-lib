import { Model } from '../../model/model.service';
import { FiresidePostTag } from './tag/tag-model';
import { FiresidePostLike } from './like/like-model';
import { FiresidePostVideo } from './video/video-model';
import { FiresidePostSketchfab } from './sketchfab/sketchfab-model';
import { ModalConfirm } from '../../modal/confirm/confirm-service';
import { HistoryTick } from '../../history-tick/history-tick-service';
import { Environment } from '../../environment/environment.service';
import { MediaItem } from '../../media-item/media-item-model';
import { Game } from '../../game/game.model';
import { Api } from '../../api/api.service';
import { appStore } from '../../../vue/services/app/app-store';
import { Registry } from '../../registry/registry.service';
import { Translate } from '../../translate/translate.service';

export class FiresidePost extends Model {
	static TYPE_TEXT = 'text';
	static TYPE_MEDIA = 'media';
	static TYPE_VIDEO = 'video';
	static TYPE_SKETCHFAB = 'sketchfab';

	static STATUS_DRAFT = 'draft';
	static STATUS_ACTIVE = 'active';
	static STATUS_REMOVED = 'removed';

	type: 'text' | 'media' | 'video' | 'sketchfab';
	hash: string;
	title: string;
	lead: string;
	header?: MediaItem;
	status: string;
	added_on: number;
	updated_on: number;
	published_on: number;
	like_count: number;
	comment_count: number;
	user: any;
	game: any;
	slug: string;
	subline: string;
	content_compiled: string;
	content_markdown: string;
	view_count?: number;
	expand_count?: number;

	tags: FiresidePostTag[] = [];
	media: MediaItem[] = [];
	videos: FiresidePostVideo[] = [];
	sketchfabs: FiresidePostSketchfab[] = [];
	user_like: FiresidePostLike | null;

	url: string;

	// For feeds.
	scroll_id?: string;

	// For uploads.
	file: any;

	constructor(data: any = {}) {
		super(data);

		if (data.header) {
			this.header = new MediaItem(data.header);
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

		this.url = Environment.firesideBaseUrl + '/post/' + this.slug;

		Registry.store('FiresidePost', this);
	}

	static pullHashFromUrl(url: string) {
		return url.substring(url.lastIndexOf('-') + 1);
	}

	async fetchLikes(): Promise<FiresidePostLike[]> {
		const response = await Api.sendRequest(`/fireside/posts/likes/${this.id}`);
		return FiresidePostLike.populate(response.likes);
	}

	$save() {
		if (this.game) {
			const options = {
				allowComplexData: ['keyGroups'],
				file: this.file,
			};

			if (!this.id) {
				return this.$_save(
					`/web/dash/developer/games/devlog/save/${this.game.id}`,
					'firesidePost',
					options,
				);
			} else {
				return this.$_save(
					`/web/dash/developer/games/devlog/save/${this.game.id}/${this.id}`,
					'firesidePost',
					options,
				);
			}
		} else {
			if (!this.id) {
				return this.$_save('/fireside/dash/posts/add', 'firesidePost');
			} else {
				return this.$_save(
					`/fireside/dash/posts/save/${this.id}`,
					'firesidePost',
				);
			}
		}
	}

	$viewed() {
		if (!appStore.state.user || this.user.id !== appStore.state.user.id) {
			HistoryTick.sendBeacon('fireside-post', this.id);
		}
	}

	$expanded() {
		if (!appStore.state.user || this.user.id !== appStore.state.user.id) {
			HistoryTick.sendBeacon('fireside-post-expand', this.id);
		}
	}

	$clearHeader() {
		return this.$_save(
			`/fireside/dash/posts/clear-header/${this.id}`,
			'firesidePost',
		);
	}

	$publish() {
		if (this.game) {
			return this.$_save(
				`/web/dash/developer/games/devlog/publish/${this.game.id}/${this.id}`,
				'firesidePost',
			);
		}

		throw new Error('Must be attached to a game to publish.');
	}

	async remove() {
		const result = await ModalConfirm.show(
			Translate.$gettext(`Are you sure you want to remove this post?`),
			undefined,
			'yes',
		);

		if (result) {
			return this.$remove();
		}
	}

	$remove() {
		if (this.game) {
			return this.$_remove(
				`/web/dash/developer/games/devlog/remove/${this.game.id}/${this.id}`,
			);
		} else {
			return this.$_remove(`/fireside/dash/posts/remove/${this.id}`);
		}
	}
}

Model.create(FiresidePost);
