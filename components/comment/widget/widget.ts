import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./widget.html?style=./widget.styl';

import { AppStore } from '../../../vue/services/app/app-store';
import { User } from '../../user/user.model';
import { Comment } from '../comment-model';
import { Subscription } from '../../subscription/subscription.model';
import { Environment } from '../../environment/environment.service';
import { Analytics } from '../../analytics/analytics.service';
import { Growls } from '../../growls/growls.service';
import { Scroll } from '../../scroll/scroll.service';
import { getTranslationLang, TranslationLangsByCode } from '../../translate/translate.service';
import { Api } from '../../api/api.service';
import { Translation } from '../../translation/translation.model';
import { AppLoading } from '../../../vue/components/loading/loading';
import { AppAuthRequired } from '../../auth/auth-required-directive.vue';
import { AppCommentWidgetComment } from './comment/comment';
import { AppLoadingFade } from '../../loading/fade/fade';
import { AppMessageThread } from '../../message-thread/message-thread';
import { AppCommentWidgetAdd } from './add/add';
import { AppMessageThreadAdd } from '../../message-thread/add/add';
import { AppMessageThreadPagination } from '../../message-thread/pagination/pagination';
import { AppMessageThreadContent } from '../../message-thread/content/content';

let incrementer = 0;

@View
@Component({
	components: {
		AppLoading,
		AppLoadingFade,
		AppMessageThread,
		AppMessageThreadAdd,
		AppMessageThreadPagination,
		AppMessageThreadContent,
		AppCommentWidgetComment,
		AppCommentWidgetAdd,
	},
	directives: {
		AppAuthRequired,
	},
})
export class AppCommentWidget extends Vue {
	@Prop(String) resource: string;
	@Prop(Number) resourceId: number;
	@Prop(Boolean) noIntro?: boolean;
	@Prop(Boolean) onlyAdd?: boolean;

	@State app: AppStore;

	id = ++incrementer;
	hasBootstrapped = false;
	hasError = false;
	isLoading = false;
	currentPage = 1;
	resourceOwner: User | null = null;
	comments: Comment[] = [];
	childComments: { [k: string]: Comment } = {};
	commentsCount = 0;
	parentCount = 0;
	perPage = 10;
	numPages = 0;

	lang = this.getTranslationLabel(getTranslationLang());
	allowTranslate = false;
	isTranslating = false;
	isShowingTranslations = false;
	translationsLoaded = false;
	translations: { [k: string]: Translation } = {};

	subscriptions: { [k: string]: Subscription } = {};

	get loginUrl() {
		return Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(this.$route.fullPath);
	}

	async created() {
		await this.init();
		this.checkPermalink();
	}

	@Watch('resourceId')
	@Watch('resourceName')
	async init() {
		if (!this.resource || !this.resourceId) {
			return;
		}

		this.hasBootstrapped = false;
		this.hasError = false;
		this.currentPage = this.$route.query.comment_page
			? parseInt(this.$route.query.comment_page, 10)
			: 1;
		await this.refreshComments();
	}

	private async refreshComments() {
		try {
			this.isLoading = true;
			const payload = await Comment.fetch(this.resource, this.resourceId, this.currentPage);
			this.isLoading = false;

			this.hasBootstrapped = true;
			this.hasError = false;
			this.comments = Comment.populate(payload.comments);
			this.resourceOwner = new User(payload.resourceOwner);
			this.perPage = payload.perPage || 10;
			this.commentsCount = payload.count || 0;
			this.parentCount = payload.parentCount || 0;

			// Child comments.
			this.childComments = {};
			if (payload.childComments) {
				const childComments: Comment[] = Comment.populate(payload.childComments);
				const grouped: any = {};
				for (const child of childComments) {
					if (!grouped[child.parent_id]) {
						grouped[child.parent_id] = [];
					}
					grouped[child.parent_id].push(child);
				}
				this.childComments = grouped;
			}

			// User subscriptions to comment threads.
			this.subscriptions = {};
			if (payload.subscriptions) {
				const subscriptions: Subscription[] = Subscription.populate(payload.subscriptions);
				const indexed: any = {};
				for (const subscription of subscriptions) {
					indexed[subscription.resource_id] = subscription;
				}
				this.subscriptions = indexed;
			}

			this.translations = {};
			this.isTranslating = false;
			this.isShowingTranslations = false;
			this.translationsLoaded = false;
			this.allowTranslate = this.gatherTranslatable().length > 0;

			this.$emit('count', this.commentsCount);
		} catch (e) {
			console.error(e);
			this.hasError = true;
		}
	}

	onCommentAdd(formModel: Comment, isReplying: boolean) {
		Analytics.trackEvent('comment-widget', 'add');

		// Was it marked as possible spam?
		if (formModel.status === Comment.STATUS_SPAM) {
			Growls.success(
				this.$gettext(
					'Your comment has been marked for review. Please allow some time for it to show on the site.'
				),
				this.$gettext('Almost there...')
			);

			if (Analytics) {
				Analytics.trackEvent('comment-widget', 'spam');
			}
		} else {
			// Otherwise refresh.
			// Force us back to the first page, but only if we weren't replying.
			// If they replied to a comment, obviously don't want to change back to the first page.
			this.changePage(isReplying ? this.currentPage : 1);
		}

		this.$emit('add', formModel);
	}

	onCommentEdited(formModel: Comment) {
		Analytics.trackEvent('comment-widget', 'edit');

		// Was it marked as possible spam?
		if (formModel.status === Comment.STATUS_SPAM) {
			Growls.success(
				this.$gettext(
					'Your comment has been marked for review. Please allow some time for it to show on the site.'
				),
				this.$gettext('Almost there...')
			);

			if (Analytics) {
				Analytics.trackEvent('comment-widget', 'spam');
			}
		} else {
			// Otherwise refresh.
			// Force us back to the first page, but only if we weren't replying.
			// If they replied to a comment, obviously don't want to change back to the first page.
			this.changePage(this.currentPage);
		}

		this.$emit('edit', formModel);
	}

	onPageChange(page: number) {
		this.changePage(page);
		Scroll.to(`comment-pagination-${this.id}`, { animate: false });
	}

	changePage(page: number) {
		// Update the page and refresh the comments list.
		this.currentPage = page || 1;
		this.refreshComments();

		if (Analytics) {
			Analytics.trackEvent('comment-widget', 'change-page', this.currentPage + '');
		}
	}

	async toggleTranslate() {
		// If we already loaded translations, just toggle back and forth.
		if (this.translationsLoaded) {
			this.isShowingTranslations = !this.isShowingTranslations;
			return;
		}

		// If they try translating again while one is already in process, skip it.
		if (this.isTranslating || this.isLoading) {
			return;
		}

		this.isTranslating = true;

		try {
			const commentIds = this.gatherTranslatable().map(item => item.id);
			const response = await Api.sendRequest(
				'/comments/translate',
				{ lang: getTranslationLang(), resources: commentIds },
				{ sanitizeComplexData: false, detach: true }
			);

			// This may happen if they changed the page while translating.
			// In that case, skip doing anything.
			if (!this.isTranslating) {
				return;
			}

			const translations: Translation[] = Translation.populate(response.translations);

			const indexed: any = {};
			for (const translation of translations) {
				indexed[translation.resource_id] = translation;
			}

			this.translations = indexed;
		} catch (e) {
			this.translations = {};
		}

		this.isTranslating = false;
		this.isShowingTranslations = true;
		this.translationsLoaded = true;
	}

	gatherTranslatable() {
		let comments = ([] as Comment[]).concat(this.comments);
		for (const child of Object.values(this.childComments)) {
			comments.push(child);
		}

		const translationCode = this.getTranslationCode(getTranslationLang());
		const translatable = comments.filter(comment => {
			if (comment.lang && comment.lang !== translationCode) {
				return true;
			}
			return false;
		});

		return translatable;
	}

	// Just a conversion.
	getTranslationCode(lang: string) {
		if (lang === 'en_US') {
			return 'en';
		} else if (lang === 'pt_BR') {
			return 'pt';
		}

		return lang;
	}

	// Just a conversion.
	getTranslationLabel(lang: string) {
		if (lang === 'en_US' || lang === 'en') {
			return 'English';
		} else if (lang === 'pt_BR' || lang === 'pt') {
			return 'Português';
		}

		return TranslationLangsByCode[lang].label;
	}

	private async checkPermalink() {
		const hash = this.$route.hash;
		if (!hash || hash.indexOf('#comment-') !== 0) {
			return;
		}

		const id = parseInt(hash.substring('#comment-'.length), 10);
		if (!id) {
			return;
		}

		try {
			const page = await Comment.getCommentPage(id);
			this.changePage(page);
			Analytics.trackEvent('comment-widget', 'permalink');
		} catch (e) {
			Growls.error(this.$gettext(`Invalid comment passed in. It may have been removed.`));
		}
	}
}
