angular.module( 'gj.Game.ScoreTable' ).factory( 'Game_ScoreTable', function( $q, Api, Model )
{
	function Game_ScoreTable( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Game_ScoreTable.SORTING_DIRECTION_DESC = 0;
	Game_ScoreTable.SORTING_DIRECTION_ASC = 1;

	Game_ScoreTable.$saveSort = function( gameId, sort )
	{
		return Api.sendRequest( '/web/dash/developer/games/api/scores/save-table-sort/' + gameId, sort );
	};

	Game_ScoreTable.prototype.$save = function()
	{
		if ( !this.id ) {
			return this.$_save( '/web/dash/developer/games/api/scores/save-table/' + this.game_id, 'gameScoreTable' );
		}
		else {
			return this.$_save( '/web/dash/developer/games/api/scores/save-table/' + this.game_id + '/' + this.id, 'gameScoreTable' );
		}
	};

	Game_ScoreTable.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/developer/games/api/scores/remove-table/' + this.game_id + '/'+ this.id );
	};

	Game_ScoreTable.prototype.$removeAllUserScores = function( userId )
	{
		return Api.sendRequest( '/web/dash/developer/games/api/scores/remove-table-user-scores/' + this.game_id + '/' + this.id + '/' + userId, {} )
			.then( function( response )
			{
				return $q( function( resolve, reject )
				{
					if ( response.success ) {
						resolve( response );
					}
					else {
						reject( response );
					}
				} );
			} );
	};

	return Model.create( Game_ScoreTable );
} );
