angular.module( 'gj.Fireside.Post.Tag' ).factory( 'Fireside_Post_Tag', function( Model, Api )
{
	function Fireside_Post_Tag( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Fireside_Post_Tag.prototype.getSref = function( page, includeParams )
	{
		var sref = 'tags.view';

		if ( includeParams ) {
			sref += '( ' + angular.toJson( this.getSrefParams( page ) ) + ' )'
		}

		return sref;
	};

	Fireside_Post_Tag.prototype.getSrefParams = function( page )
	{
		return { tag: this.tag };
	};

	Fireside_Post_Tag.prototype.getUrl = function( page )
	{
		return $state.href( this.getSref( page ), this.getSrefParams( page ) );
	};

	return Model.create( Fireside_Post_Tag );
} );