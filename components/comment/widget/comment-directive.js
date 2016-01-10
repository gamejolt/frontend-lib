angular.module( 'gj.Comment.Widget' ).directive( 'gjCommentWidgetComment', function( $parse, App, Environment, Comment_Vote, Subscription, Growls )
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
				scope.isVotePending = false;
				scope.isFollowPending = false;

				scope.profileUrl = Environment.wttfBaseUrl + scope.comment.user.url;
				scope.isOwner = scope.ctrl.resourceOwner.id == scope.comment.user.id;

				scope.commentState = {
					canToggleComment: undefined,
					showFullComment: true,
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
					var userHasVoted = scope.ctrl.userVotes[ scope.comment.id ];

					if ( voteCount <= 0 ) {
						if ( scope.canVote ) {
							scope.votingTooltip = 'Give this comment some love!';
						}
					}
					else if ( voteCount == 1 ) {
						if ( userHasVoted ) {
							scope.votingTooltip = 'You like this comment.';
						}
						else {
							scope.votingTooltip = 'One person likes this comment.';
						}
					}
					else if ( voteCount == 2 && userHasVoted ) {
						scope.votingTooltip = 'You and another person like this comment.';
					}
					else {
						if ( userHasVoted ) {
							scope.votingTooltip = 'You and ' + (voteCount - 1) + ' people like this comment.';
						}
						else {
							scope.votingTooltip = voteCount + ' people like this comment!';
						}
					}
				} );

				scope.onReplyClick = function()
				{
					commentWidget.replyToComment( scope.comment );
				};

				scope.onVoteClick = function()
				{
					if ( scope.isVotePending ) {
						return;
					}

					scope.isVotePending = true;

					// If adding a vote.
					if ( !scope.ctrl.userVotes[ scope.comment.id ] ) {

						var newVote = new Comment_Vote( { comment_id: scope.comment.id } );

						newVote.$save()
							.then( function()
							{
								scope.ctrl.userVotes[ scope.comment.id ] = newVote;
								++scope.comment.votes;
								scope.isVotePending = false;
								Growls.add( 'success', 'You\'ve just upvoted this comment. This lets us know the quality of comments and helps keep the site fresh.' );
							} );
					}
					// If removing a vote.
					else {

						scope.ctrl.userVotes[ scope.comment.id ].$remove()
							.then( function()
							{
								delete scope.ctrl.userVotes[ scope.comment.id ];
								--scope.comment.votes;
								scope.isVotePending = false;
							} );
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
			},
		}
	};
} );
