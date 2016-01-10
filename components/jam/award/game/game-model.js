angular.module( 'gj.Jam.Award.Game' ).factory( 'Jam_Award_Game', function( Model, Api, Jam_Award )
{
	function Jam_Award_Game( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.jam_award ) {
				this.jam_award = new Jam_Award( data.jam_award );
			}
		}
	}

	Jam_Award_Game.$saveSort = function( awardId, sortedIds )
	{
		return Api.sendRequest( '/jams/manage/jams/awards/save-game-sort/' + awardId, sortedIds );
	};

	Jam_Award_Game.$assignToAward = function( awardId, gameId )
	{
		// Force POST.
		return Api.sendRequest( '/jams/manage/jams/awards/assign-game/' + awardId + '/' + gameId, {} )
			.then( function( response )
			{
				return Jam_Award_Game.processCreate( response, 'jamAwardGame' );
			} )
			.then( function( response )
			{
				return new Jam_Award_Game( response.jamAwardGame );
			} );
	};

	Jam_Award_Game.prototype.$remove = function()
	{
		return this.$_remove( '/jams/manage/jams/awards/remove-assigned-game/' + this.jam_award_id + '/' + this.game_id );
	};

	return Model.create( Jam_Award_Game );
} );
