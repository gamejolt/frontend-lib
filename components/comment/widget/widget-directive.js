angular.module( 'gj.Comment.Widget' ).directive( 'gjCommentWidget', function()
{
	return {
		restrict: 'E',
		templateUrl: '/lib/gj-lib-client/components/comment/widget/widget.html',
		scope: {},
		bindToController: {
			resource: '@commentResource',
			resourceId: '=commentResourceId',
			currentPage: '=?currentPage',
		},
		controllerAs: 'ctrl',
		controller: function( $scope, $state, $window, $location, $timeout, $injector, $sce, App, Comment, Comment_Vote, Subscription, User, Growls, Environment, Scroll,
			Api, Translation, Translate )
		{
			var _this = this;
			$scope.App = App;
			$scope.Translate = Translate;

			// Not required.
			var Analytics = null;
			if ( $injector.has( 'Analytics' ) ) {
				Analytics = $injector.get( 'Analytics' );
			}

			this.hasLoaded = false;
			this.hasError = false;
			this.resourceOwner = null;
			this.comments = [];
			this.childComments = {};
			this.commentsCount = 0;
			this.parentCount = 0;
			this.currentPage = this.currentPage || 1;
			this.perPage = 10;
			this.numPages = 0;  // The pagination widget will set this.
			this.replyingTo = undefined;
			this.highlightedComment = null;

			this.allowTranslate = false;
			this.isTranslating = false;
			this.isShowingTranslations = false;
			this.translationsLoaded = false;
			this.translations = {};

			this.subscriptions = {};

			if ( !App.user ) {
				this.loginUrl = Environment.authBaseUrl + '/login?redirect=' + $window.encodeURIComponent( $location.absUrl() );
			}

			refreshComments();
			checkPermalink();

			this.replyToComment = function( comment )
			{
				this.replyingTo = comment.id;
			};

			this.onCommentAdd = function( formModel, isReplying )
			{
				if ( Analytics ) {
					Analytics.trackEvent( 'comment-widget', 'add' );
				}

				// Was it marked as possible spam?
				if ( formModel.status == Comment.STATUS_SPAM ) {
					Growls.success( 'Your comment has been marked for review. Please allow some time for it to show on the site.', 'Almost there...' );

					if ( Analytics ) {
						Analytics.trackEvent( 'comment-widget', 'spam' );
					}
				}
				// Otherwise refresh.
				else {

					// Force us back to the first page, but only if we weren't replying.
					// If they replied to a comment, obviously don't want to change back to the first page.
					this.onPageChange( null, isReplying ? this.currentPage : 1 );
				}
			};

			this.onPageChange = function( $event, page, shouldScroll )
			{
				var _this = this;

				// Don't allow it to redirect through the href of the page link.
				if ( $event ) {
					$event.preventDefault();
				}

				// Update the page and refresh the comments list.
				this.currentPage = page || 1;
				refreshComments();
				updateUrl();

				if ( shouldScroll ) {
					Scroll.to( 'comment-pagination' );
				}

				if ( Analytics ) {
					Analytics.trackEvent( 'comment-widget', 'change-page', this.currentPage );
				}
			};

			this.toggleTranslate = function()
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

				var commentIds = _.pluck( this.gatherTranslatable(), 'id' );
				Api.sendRequest( '/comments/translate', { lang: Translate.lang, resources: commentIds }, { sanitizeComplexData: false, detach: true } )
					.then( function( response )
					{
						// This may happen if they changed the page while translating.
						// In that case, skip doing anything.
						if ( !_this.isTranslating ) {
							return;
						}

						var translations = Translation.populate( response.translations );

						// This way when the translation puts in "style" tags that it will carry into the HTML.
						_this.translations = _.indexBy( translations.map( function( item )
						{
							item.content = $sce.trustAsHtml( item.content );
							return item;
						} ), 'resource_id' );

						_this.isTranslating = false;
						_this.isShowingTranslations = true;
						_this.translationsLoaded = true;
					} )
					.catch( function()
					{
						_this.translations = {};
						_this.isTranslating = false;
						_this.isShowingTranslations = true;
						_this.translationsLoaded = true;
					} );
			};

			this.gatherTranslatable = function()
			{
				var comments = _this.comments;
				comments = comments.concat( _( _this.childComments ).values().flatten().value() );

				var translationCode = this.getTranslationCode( Translate.lang );
				var translatable = comments.filter( function( comment )
				{
					if ( comment.lang && comment.lang != translationCode ) {
						return true;
					}
					return false;
				} );

				return translatable;
			};

			this.getTranslationCode = function( lang )
			{
				if ( lang == 'en_US' ) {
					return 'en';
				}
				else if ( lang == 'pt_BR' ) {
					return 'pt';
				}

				return lang;
			};

			this.getTranslationLabel = function( lang )
			{
				if ( lang == 'en_US' || lang == 'en' ) {
					return 'English';
				}
				else if ( lang == 'pt_BR' || lang == 'pt' ) {
					return 'Português';
				}

				return Translate.langsByCode[ lang ].label;
			};

			function refreshComments()
			{
				// Pull in new comments, huzzah!
				Comment.fetch( _this.resource, _this.resourceId, _this.currentPage )
					.then( function( payload )
					{
						// Check the hash in the URL to see if we should autoscroll to a comment.
						checkAutoScroll();

						_this.hasLoaded = true;
						_this.hasError = false;
						_this.comments = Comment.populate( payload.comments );
						_this.resourceOwner = new User( payload.resourceOwner );
						_this.perPage = payload.perPage || 10;
						_this.commentsCount = payload.count || 0;
						_this.parentCount = payload.parentCount || 0;

						// Child comments.
						_this.childComments = {};
						if ( payload.childComments ) {
							var childComments = Comment.populate( payload.childComments );
							_this.childComments = _.groupBy( childComments, 'parent_id' );
						}

						// User subscriptions to comment threads.
						_this.subscriptions = {};
						if ( payload.subscriptions ) {
							var subscriptions = Subscription.populate( payload.subscriptions );
							_this.subscriptions = _.indexBy( subscriptions, 'resource_id' );
						}

						_this.translations = {};
						_this.isTranslating = false;
						_this.isShowingTranslations = false;
						_this.translationsLoaded = false;
						_this.allowTranslate = _this.gatherTranslatable().length;
					} )
					.catch( function( payload )
					{
						_this.hasError = true;
					} );
			}

			function updateUrl( commentId )
			{
				var params = {
					comment_page: _this.currentPage > 1 ? _this.currentPage : undefined,
				};

				if ( commentId ) {
					params['#'] = 'comment-' + commentId;
					_this.highlightedComment = commentId;
				}
				else {
					_this.highlightedComment = null;
				}

				// We replace the URL and don't notify so that the controller doesn't reload.
				$state.go( $state.current, params, { location: 'replace', notify: false } );
			}

			function checkPermalink()
			{
				var hash = $location.hash();
				if ( !hash || hash.indexOf( 'comment-' ) !== 0 ) {
					return;
				}

				var id = parseInt( hash.substring( 'comment-'.length ) );
				if ( !id ) {
					return;
				}

				Comment.getCommentPage( id )
					.then( function( page )
					{
						_this.currentPage = page;
						refreshComments();
						updateUrl( id );

						if ( Analytics ) {
							Analytics.trackEvent( 'comment-widget:permalink' );
						}
					} )
					.catch( function()
					{
						Growls.error( 'Invalid comment passed in.' );

						// TODO: Track this error.
					} );
			}

			function checkAutoScroll()
			{
				var hash = $location.hash();
				if ( hash && hash.indexOf( 'comment-' ) === 0 ) {
					$timeout( function()
					{
						if ( $window.document.getElementById( hash ) ) {
							Scroll.to( hash );
						}
					}, 0, false );
				}
			}
		},
	};
} );
