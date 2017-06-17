angular
	.module('gj.Jam.Game')
	.factory('Jam_Game', function(Model, User, Environment, Api, Jam_Award) {
		function Jam_Game(data) {
			if (data) {
				angular.extend(this, data);

				if (data.developer) {
					this.developer = new User(data.developer);
				}

				if (data.entered_on) {
					this.entered_on = new Date(data.entered_on);
				}

				if (data.awards) {
					this.awards = Jam_Award.populate(data.awards);
				}
			}
		}

		Jam_Game.prototype.getUrl = function(jam) {
			if (jam) {
				return '/' + jam.url + '/games/' + this.slug + '/' + this.id;
			}

			return '';
		};

		Jam_Game.prototype.getFullUrl = function(jam) {
			return Environment.jamsIoBaseUrl + this.getUrl(jam);
		};

		/**
	 * The below methods can't use the model helpers.
	 * We don't want to pull in the data from the server and repopulate this model.
	 * This is because we may lose special fields like "force_hidden" and "approved_entry".
	 */

		Jam_Game.prototype.$hide = function(jamId) {
			var _this = this;
			return Api.sendRequest(
				'/jams/manage/jams/games/set-game-visibility/' +
					jamId +
					'/' +
					this.id +
					'/0',
				{}
			).then(function() {
				_this.force_hidden = true;
			});
		};

		Jam_Game.prototype.$unhide = function(jamId) {
			var _this = this;
			return Api.sendRequest(
				'/jams/manage/jams/games/set-game-visibility/' +
					jamId +
					'/' +
					this.id +
					'/1',
				{}
			).then(function() {
				_this.force_hidden = false;
			});
		};

		Jam_Game.prototype.$approve = function(jamId) {
			var _this = this;
			return Api.sendRequest(
				'/jams/manage/jams/games/approve-entry/' + jamId + '/' + this.id,
				{}
			).then(function() {
				_this.approved_entry = true;
			});
		};

		Jam_Game.prototype.$reject = function(jamId) {
			var _this = this;
			return Api.sendRequest(
				'/jams/manage/jams/games/reject-entry/' + jamId + '/' + this.id,
				{}
			).then(function() {
				_this.approved_entry = false;
			});
		};

		return Model.create(Jam_Game);
	});
