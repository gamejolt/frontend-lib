angular.module( 'gj.Fireside.Post' ).factory( 'Fireside_Post', function( Environment, Model, Api, Fireside_Post_Tag, MediaItem )
{
	function Fireside_Post( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		if ( this.header && angular.isObject( this.header ) ) {
			this.header = new MediaItem( this.header );
		}

		if ( this.tags && angular.isArray( this.tags ) && this.tags.length ) {
			this.tags = Fireside_Post_Tag.populate( this.tags );
		}

		this.url = Environment.firesideBaseUrl + '/post/' + this.slug;
	}

	Fireside_Post.STATUS_DRAFT = 'draft';
	Fireside_Post.STATUS_ACTIVE = 'active';
	Fireside_Post.STATUS_REMOVED = 'removed';

	Fireside_Post.pullHashFromUrl = function( url )
	{
		return url.substring( url.lastIndexOf( '-' ) + 1 );
	};

	Fireside_Post.prototype.$save = function()
	{
		if ( !this.id ) {
			return this.$_save( '/fireside/dash/posts/add', 'firesidePost' );
		}
		else {
			return this.$_save( '/fireside/dash/posts/save/' + this.id, 'firesidePost' );
		}
	};

	Fireside_Post.prototype.$clearHeader = function()
	{
		return this.$_save( '/fireside/dash/posts/clear-header/' + this.id, 'firesidePost' );
	};

	Fireside_Post.prototype.$remove = function()
	{
		return this.$_remove( '/fireside/dash/posts/remove/' + this.id );
	};

	return Model.create( Fireside_Post );
} );
