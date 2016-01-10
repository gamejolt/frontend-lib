angular.module( 'gj.Game.Trophy' ).factory( 'Game_Trophy', function( Api, Model )
{
	function Game_Trophy( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		this.difficultyLabel = Game_Trophy.difficultyLabels[ this.difficulty ];
	}

	Game_Trophy.DIFFICULTY_BRONZE = 1;
	Game_Trophy.DIFFICULTY_SILVER = 2;
	Game_Trophy.DIFFICULTY_GOLD = 3;
	Game_Trophy.DIFFICULTY_PLATINUM = 4;

	Game_Trophy.difficulties = [
		Game_Trophy.DIFFICULTY_BRONZE,
		Game_Trophy.DIFFICULTY_SILVER,
		Game_Trophy.DIFFICULTY_GOLD,
		Game_Trophy.DIFFICULTY_PLATINUM,
	];

	Game_Trophy.difficultyLabels = {};
	Game_Trophy.difficultyLabels[ Game_Trophy.DIFFICULTY_BRONZE ] = 'Bronze';
	Game_Trophy.difficultyLabels[ Game_Trophy.DIFFICULTY_SILVER ] = 'Silver';
	Game_Trophy.difficultyLabels[ Game_Trophy.DIFFICULTY_GOLD ] = 'Gold';
	Game_Trophy.difficultyLabels[ Game_Trophy.DIFFICULTY_PLATINUM ] = 'Platinum';

	/**
	 * Indexes the achieved trophies by their trophy ID.
	 */
	Game_Trophy.indexAchieved = function( achieved )
	{
		return _.indexBy( achieved, 'game_trophy_id' );
	};

	/**
	 * Splits out the trophies by achieved/unachieved.
	 * @param {Game_Trophy[]} trophies
	 * @param {User_GameTrophy[]} achievedIndexed - Should be indexed by trophy ID.
	 */
	Game_Trophy.splitAchieved = function( trophies, achievedIndexed )
	{
		var split = {};
		split.achieved = trophies.filter( function( trophy )
		{
			return achievedIndexed[ trophy.id ];
		} );

		split.unachieved = trophies.filter( function( trophy )
		{
			return !achievedIndexed[ trophy.id ];
		} );

		return split;
	};

	Game_Trophy.$saveSort = function( gameId, difficulty, sort )
	{
		return Api.sendRequest( '/web/dash/developer/games/api/trophies/save-sort/' + gameId + '/' + difficulty, sort );
	};

	Game_Trophy.prototype.$save = function()
	{
		if ( !this.id ) {
			return this.$_save( '/web/dash/developer/games/api/trophies/save/' + this.game_id, 'gameTrophy', { file: this.file } );
		}
		else {
			// May or may not have an upload file on an edit.
			return this.$_save( '/web/dash/developer/games/api/trophies/save/' + this.game_id + '/' + this.id, 'gameTrophy', { file: this.file || null } );
		}
	};

	Game_Trophy.prototype.$clearImage = function()
	{
		return this.$_save( '/web/dash/developer/games/api/trophies/clear-image/' + this.game_id + '/' + this.id, 'gameTrophy' );
	};

	Game_Trophy.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/developer/games/api/trophies/remove/'+ this.game_id + '/' + this.id );
	};

	return Model.create( Game_Trophy );
} );
