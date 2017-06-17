angular
	.module('gj.Jam.Game.Vote')
	.factory('Jam_Game_Vote', function(Model, Api) {
		function Jam_Game_Vote(data) {
			if (data) {
				angular.extend(this, data);
			}
		}

		Jam_Game_Vote.$saveVote = function(jamId, game, voteData) {
			return Api.sendRequest(
				'/jams-io/voting/save-vote/' + jamId + '/' + game.id,
				voteData,
				{
					detach: true,
					allowComplexData: ['votes'],
				}
			);
		};

		Jam_Game_Vote.$clearVote = function(jamId, game) {
			return Api.sendRequest(
				'/jams-io/voting/clear-vote/' + jamId + '/' + game.id,
				{},
				{ detach: true }
			);
		};

		return Model.create(Jam_Game_Vote);
	});
