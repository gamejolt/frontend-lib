angular.module( 'gj.Comment.Widget' ).directive( 'gjCommentWidgetComment', function( $parse, App, Environment, Comment_Vote, Subscription, Growls, Report_Modal, gettextCatalog )
{
	return {
		require: '^gjCommentWidget',
		templateUrl: '/lib/gj-lib-client/components/comment/widget/comment.html',
		scope: true,
		link: {
			pre: function( scope, element, attrs, commentWidget )
			{
				scope.comment = $parse( attrs.gjCommentWidgetComment )( scope );
				scope.isChild = $parse( attrs.commentIsChild )( scope );
				scope.isFollowPending = false;

				scope.profileUrl = Environment.wttfBaseUrl + scope.comment.user.url;
				scope.isOwner = scope.ctrl.resourceOwner.id == scope.comment.user.id;

				scope.commentState = {
					canToggleComment: undefined,
					showFullComment: true,
					selectedVideo: undefined,
				};

				// Can't subscribe if...
				// they aren't logged in
				// this is a child comment
				// the resource belongs to them
				scope.canFollow = true;
				if ( !App.user ) {
					scope.canFollow = false;
				}
				else if ( scope.isChild ) {
					scope.canFollow = false;
				}
				else if ( scope.ctrl.resourceOwner.id == App.user.id ) {
					scope.canFollow = false;
				}

				// Can't vote on this comment if...
				// they aren't logged in
				// they wrote the comment
				// the resource belongs to them (they will just upvote stuff that is nice)
				scope.canVote = true;
				if ( !App.user ) {
					scope.canVote = false;
				}
				else if ( scope.comment.user.id == App.user.id ) {
					scope.canVote = false;
				}
				else if ( scope.ctrl.resourceOwner.id == App.user.id ) {
					scope.canVote = false;
				}

				scope.$watch( 'comment.votes', function( voteCount )
				{
					var userHasVoted = !!scope.comment.userVote;

					if ( voteCount <= 0 ) {
						if ( scope.canVote ) {
							/// Tooltip for comment voting when no one has liked a comment yet.
							scope.votingTooltip = gettextCatalog.getString( 'Give this comment some love!' );
						}
					}
					else if ( userHasVoted ) {
						if ( voteCount == 1 ) {
							/// Tooltip for comment voting when you like a comment and no one else has liked it yet.
							gettextCatalog.getString( 'You like this comment' );
						}
						else {
							/// Tooltip for comment voting when you and other people like it.
							scope.votingTooltip = gettextCatalog.getPlural( (voteCount - 1), 'You and another person like this comment.', 'You and {{ $count | number }} people like this comment.', {} );
						}
					}
					else {
						/// Tooltip for comment voting when you haven't liked it yet, but other people do.
						scope.votingTooltip = gettextCatalog.getPlural( voteCount, 'One person likes this comment.', '{{ $count | number }} people like this comment.', {} );
					}
				} );

				scope.onReplyClick = function()
				{
					commentWidget.replyToComment( scope.comment );
				};

				scope.onVoteClick = function()
				{
					// If adding a vote.
					if ( !scope.comment.userVote ) {
						scope.comment.$like();
					}
					// If removing a vote.
					else {
						scope.comment.$removeLike();
					}
				};

				scope.onFollowClick = function()
				{
					if ( scope.isFollowPending ) {
						return;
					}

					scope.isFollowPending = true;

					if ( !scope.ctrl.subscriptions[ scope.comment.id ] ) {

						Subscription.$subscribe( scope.comment.id )
							.then( function( newSubscription )
							{
								scope.ctrl.subscriptions[ scope.comment.id ] = newSubscription;
								scope.isFollowPending = false;
							} );
					}
					else {

						scope.ctrl.subscriptions[ scope.comment.id ].$remove()
							.then( function()
							{
								delete scope.ctrl.subscriptions[ scope.comment.id ];
								scope.isFollowPending = false;
							} );
					}
				};

				scope.selectVideo = function( video )
				{
					if ( scope.commentState.selectedVideo === video ) {
						scope.commentState.selectedVideo = undefined;
					}
					else {
						scope.commentState.selectedVideo = video;
					}
				};

				scope.report = function( comment )
				{
					Report_Modal.show( comment );
				};
			},
		}
	};
} );
