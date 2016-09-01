import { Component, Inject, Input, Output } from 'ng-metadata/core';
import { Comment } from './../comment-model';
import template from 'html!./widget.html';

@Component({
	selector: 'gj-comment-widget',
	template,
})
export class WidgetComponent
{
	@Input( '@' ) resource: string;
	@Input( '<' ) resourceId: number;
	@Input( '<?' ) initialPage?: number;
	@Input( '<' ) noIntro: boolean;

	@Output( '?' ) onCommentCount: Function;

	hasLoaded = false;
	hasError = false;
	resourceOwner?: any = undefined;
	comments: Comment[] = [];
	childComments: { [k: string]: Comment[] } = {};
	commentsCount = 0;
	parentCount = 0;
	currentPage = this.initialPage || 1;
	perPage = 10;
	numPages = 0;  // The pagination widget will set this.
	replyingTo?: number = undefined;
	highlightedComment?: number = undefined;

	allowTranslate = false;
	isTranslating = false;
	isShowingTranslations = false;
	translationsLoaded = false;
	translations = {};

	loginUrl: string;

	constructor(
		@Inject( '$state' ) private $state: ng.ui.IStateService,
		@Inject( '$window' ) private $window: ng.IWindowService,
		@Inject( '$location' ) private $location: ng.ILocationService,
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( '$sce' ) private $sce: ng.ISCEService,
		@Inject( 'Environment' ) env: any,
		@Inject( 'Api' ) private api: any,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'Analytics' ) private analytics: any,
		@Inject( 'App' ) public app: any,
		@Inject( 'Comment' ) private commentModel: typeof Comment,
		@Inject( 'User' ) private userModel: any,
		@Inject( 'Scroll' ) private scroll: any,
		@Inject( 'Translation' ) private translationModel: any,
		@Inject( 'Translate' ) public translate: any,
	)
	{
		if ( !app.user ) {
			this.loginUrl = env.authBaseUrl + '/login?redirect=' + $window.encodeURIComponent( $location.absUrl() );
		}

		this.refreshComments();
		this.checkPermalink();
	}

	refreshComments()
	{
		// Pull in new comments, huzzah!
		this.commentModel.fetch( this.resource, this.resourceId, this.currentPage )
			.then( ( payload: any ) =>
			{
				// Check the hash in the URL to see if we should autoscroll to a comment.
				this.checkAutoScroll();

				this.hasLoaded = true;
				this.hasError = false;
				this.comments = Comment.populate( payload.comments );
				this.resourceOwner = new this.userModel( payload.resourceOwner );
				this.perPage = payload.perPage || 10;
				this.commentsCount = payload.count || 0;
				this.parentCount = payload.parentCount || 0;

				// Child comments.
				this.childComments = {};
				if ( payload.childComments ) {
					var childComments = Comment.populate( payload.childComments );
					this.childComments = _.groupBy( childComments, 'parent_id' );
				}

				// User subscriptions to comment threads.
				// this.subscriptions = {};
				// if ( payload.subscriptions ) {
				// 	var subscriptions = Subscription.populate( payload.subscriptions );
				// 	this.subscriptions = _.indexBy( subscriptions, 'resource_id' );
				// }

				this.translations = {};
				this.isTranslating = false;
				this.isShowingTranslations = false;
				this.translationsLoaded = false;
				this.allowTranslate = !!this.gatherTranslatable().length;

				if ( this.onCommentCount ) {
					this.onCommentCount( { $count: this.commentsCount } );
				}
			} )
			.catch( () =>
			{
				this.hasError = true;
			} );
	}

	updateUrl( commentId?: number )
	{
		let params: any = {
			comment_page: this.currentPage > 1 ? this.currentPage : undefined,
		};

		if ( commentId ) {
			params['#'] = 'comment-' + commentId;
			this.highlightedComment = commentId;
		}
		else {
			this.highlightedComment = undefined;
		}

		// We replace the URL and don't notify so that the controller doesn't reload.
		this.$state.go( this.$state.current, params, { location: 'replace', notify: false } );
	}

	checkPermalink()
	{
		const hash = this.$location.hash();
		if ( !hash || hash.indexOf( 'comment-' ) !== 0 ) {
			return;
		}

		const id = parseInt( hash.substring( 'comment-'.length ) );
		if ( !id ) {
			return;
		}

		Comment.getCommentPage( id )
			.then( ( page: number ) =>
			{
				this.currentPage = page;
				this.refreshComments();
				this.updateUrl( id );

				this.analytics.trackEvent( 'comment-widget:permalink' );
			} )
			.catch( () =>
			{
				// TODO: Track this error.
				this.growls.error( 'Invalid comment passed in.' );
			} );
	}

	checkAutoScroll()
	{
		const hash = this.$location.hash();
		if ( hash && hash.indexOf( 'comment-' ) === 0 ) {
			this.$timeout( () =>
			{
				if ( this.$window.document.getElementById( hash ) ) {
					this.scroll.to( hash );
				}
			}, 0, false );
		}
	}

	replyToComment( commentId: number )
	{
		this.replyingTo = commentId;
	}

	onCommentAdd( formModel: Comment, isReplying: boolean )
	{
		this.analytics.trackEvent( 'comment-widget', 'add' );

		// Was it marked as possible spam?
		if ( formModel.status == Comment.STATUS_SPAM ) {
			this.growls.success( 'Your comment has been marked for review. Please allow some time for it to show on the site.', 'Almost there...' );
			this.analytics.trackEvent( 'comment-widget', 'spam' );
		}
		// Otherwise refresh.
		else {

			// Force us back to the first page, but only if we weren't replying.
			// If they replied to a comment, obviously don't want to change back to the first page.
			this.onPageChange( undefined, isReplying ? this.currentPage : 1 );
		}
	}

	onPageChange( $event: ng.IAngularEvent | undefined, page: number, shouldScroll = false )
	{
		// Don't allow it to redirect through the href of the page link.
		if ( $event ) {
			$event.preventDefault();
		}

		// Update the page and refresh the comments list.
		this.currentPage = page || 1;
		this.refreshComments();
		this.updateUrl();

		if ( shouldScroll ) {
			this.scroll.to( 'comment-pagination' );
		}

		this.analytics.trackEvent( 'comment-widget', 'change-page', this.currentPage );
	}

	toggleTranslate()
	{
		// If we already loaded translations, just toggle back and forth.
		if ( this.translationsLoaded ) {
			this.isShowingTranslations = !this.isShowingTranslations;
			return;
		}

		// If they try translating again while one is already in process, skip it.
		if ( this.isTranslating ) {
			return;
		}

		this.isTranslating = true;

		const commentIds: number[] = _.pluck( this.gatherTranslatable(), 'id' );
		this.api.sendRequest( '/comments/translate', { lang: this.translate.lang, resources: commentIds }, { sanitizeComplexData: false, detach: true } )
			.then( ( response: any ) =>
			{
				// This may happen if they changed the page while translating.
				// In that case, skip doing anything.
				if ( !this.isTranslating ) {
					return;
				}

				const translations = this.translationModel.populate( response.translations );

				// This way when the translation puts in "style" tags that it will carry into the HTML.
				this.translations = _.indexBy( translations.map( ( item: any ) =>
				{
					item.content = this.$sce.trustAsHtml( item.content );
					return item;
				} ), 'resource_id' );

				this.isTranslating = false;
				this.isShowingTranslations = true;
				this.translationsLoaded = true;
			} )
			.catch( () =>
			{
				this.translations = {};
				this.isTranslating = false;
				this.isShowingTranslations = true;
				this.translationsLoaded = true;
			} );
	}

	gatherTranslatable()
	{
		let comments = this.comments.concat( _( this.childComments ).values().flatten().value() );
		const translationCode = this.getTranslationCode( this.translate.lang );
		return comments.filter( ( comment: Comment ) => comment.lang && comment.lang != translationCode );
	}

	getTranslationCode( lang: string )
	{
		if ( lang == 'en_US' ) {
			return 'en';
		}
		else if ( lang == 'pt_BR' ) {
			return 'pt';
		}

		return lang;
	}

	getTranslationLabel( lang: string )
	{
		if ( lang == 'en_US' || lang == 'en' ) {
			return 'English';
		}
		else if ( lang == 'pt_BR' || lang == 'pt' ) {
			return 'Português';
		}

		return this.translate.langsByCode[ lang ].label;
	}
}
