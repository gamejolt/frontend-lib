angular
	.module('gj.Game.KeyPool')
	.factory('Game_KeyPool', function(Model, User, Game, Notification, Api) {
		function Game_KeyPool(data) {
			if (data) {
				angular.extend(this, data);

				if (data.game) {
					this.game = new Game(data.game);
				}

				if (data.game_package) {
					this.game_package = new Game_Package(data.game_package);
				}
			}
		}

		Game_KeyPool.prototype.$import = function() {
			return Api.sendRequest(
				'/web/dash/developer/games/key-pools/import/' +
					this.game_id +
					'/' +
					this.game_package_id,
				{
					data: this.data,
					provider: this.provider,
				},
			);
		};

		return Model.create(Game_KeyPool);
	});
