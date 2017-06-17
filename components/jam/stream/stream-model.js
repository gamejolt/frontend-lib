angular
	.module('gj.Jam.Stream')
	.factory('Jam_Stream', function(Model, User, Api) {
		function Jam_Stream(data) {
			if (data) {
				angular.extend(this, data);
			}

			if (this.user) {
				this.user = new User(this.user);
			}
		}

		Jam_Stream.PROVIDER_TWITCH = 'twitch';

		Jam_Stream.prototype.$set = function() {
			return this.$_save('/jams-io/streams/set/' + this.jam_id, 'jamStream');
		};

		Jam_Stream.prototype.$clear = function() {
			return this.$_remove('/jams-io/streams/clear/' + this.jam_id);
		};

		Jam_Stream.prototype.$remove = function() {
			return this.$_remove('/jams/manage/jams/streams/remove/' + this.id);
		};

		return Model.create(Jam_Stream);
	});
