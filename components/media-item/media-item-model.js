angular.module( 'gj.MediaItem' ).factory( 'MediaItem', function( Model )
{
	function MediaItem( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	MediaItem.TYPE_GAME_THUMBNAIL = 'game-thumbnail';
	MediaItem.TYPE_GAME_HEADER = 'game-header';
	MediaItem.TYPE_GAME_SCREENSHOT = 'game-screenshot';
	MediaItem.TYPE_GAME_TROPHY = 'game-trophy';

	MediaItem.TYPE_FIRESIDE_POST_HEADER = 'fireside-post-header';
	MediaItem.TYPE_FIRESIDE_POST_IMAGE = 'fireside-post-image';

	MediaItem.TYPE_FEATURED_HEADER = 'featured-header';

	MediaItem.STATUS_ACTIVE = 'active';
	MediaItem.STATUS_REMOVED = 'removed';

	MediaItem.prototype.getDimensions = function( maxWidth, maxHeight, options )
	{
		// Simple getter for dimensions.
		if ( !maxWidth && !maxHeight ) {
			return {
				width: this.width,
				height: this.height,
			};
		}
		// This case is a bit silly, but whatever.
		else if ( options && options.force && maxWidth && maxHeight ) {
			return {
				width: maxWidth,
				height: maxHeight,
			};
		}

		var aspectRatio = this.height / this.width;
		var width, height;

		// Forcing one of the dimensions is easy.
		if ( options && options.force ) {
			width = maxWidth || height / aspectRatio;
			height = maxHeight || width * aspectRatio;
		}
		else {
			// Setting max for both.
			if ( maxWidth && maxHeight ) {
				width = Math.min( this.width, maxWidth );
				height = width * aspectRatio;

				if ( height > maxHeight ) {
					height = maxHeight;
					width = height / aspectRatio;
				}
			}
			else if ( maxWidth && !maxHeight ) {
				width = Math.min( this.width, maxWidth );
				height = width * aspectRatio;
			}
			else if ( !maxWidth && maxHeight ) {
				height = Math.min( this.height, maxHeight );
				width = height / aspectRatio;
			}
		}

		return {
			width: width,
			height: height,
		};
	}

	MediaItem.prototype.getCrop = function()
	{
		if ( !this.crop_end_x || !this.crop_end_y ) {
			return null;
		}

		return {
			x: this.crop_start_x,
			y: this.crop_start_y,
			x2: this.crop_end_x,
			y2: this.crop_end_y,
		};
	};

	MediaItem.prototype.$save = function()
	{
		if ( this.type != MediaItem.TYPE_FIRESIDE_POST_IMAGE && this.type != MediaItem.TYPE_FIRESIDE_POST_HEADER ) {
			throw new Error( 'Can only save fireside media items.' );
		}

		if ( !this.id ) {
			return this.$_save( '/fireside/dash/posts/media/upload/' + this.post_id + '/' + this.type, 'mediaItem', { file: this.file } );
		}
	};

	MediaItem.prototype.$remove = function()
	{
		if ( this.type != MediaItem.TYPE_FIRESIDE_POST_IMAGE && this.type != MediaItem.TYPE_FIRESIDE_POST_HEADER ) {
			throw new Error( 'Can only save fireside media items.' );
		}

		return this.$_remove( '/fireside/dash/posts/media/remove/' + this.id );
	};

	return Model.create( MediaItem );
} );
