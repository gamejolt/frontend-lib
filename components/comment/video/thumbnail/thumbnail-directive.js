angular.module( 'gj.Comment.Video.Thumbnail' ).component( 'gjCommentVideoThumbnail', {
	bindings: {
		video: '<',
		showUser: '<',
		showGame: '<',
	},
	templateUrl: '/lib/gj-lib-client/components/comment/video/thumbnail/thumbnail.html',
} );
