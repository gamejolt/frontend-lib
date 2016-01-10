angular.module( 'gj.Jam.Award' ).factory( 'Jam_Award', function( Model, Api )
{
	function Jam_Award( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Jam_Award.$saveSort = function( jamId, sortedIds )
	{
		return Api.sendRequest( '/jams/manage/jams/awards/save-sort/' + jamId, sortedIds );
	};

	Jam_Award.prototype.$save = function()
	{
		// Are we adding or saving?
		if ( !this.id ) {
			return this.$_save( '/jams/manage/jams/awards/save/' + this.jam_id, 'jamAward' );
		}
		else {
			return this.$_save( '/jams/manage/jams/awards/save/' + this.jam_id + '/' + this.id, 'jamAward' );
		}
	};

	Jam_Award.prototype.$remove = function()
	{
		return this.$_remove( '/jams/manage/jams/awards/remove/' + this.id );
	};

	return Model.create( Jam_Award );
} );
