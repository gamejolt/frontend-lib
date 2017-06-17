angular
	.module('gj.Jam.Organizer')
	.factory('Jam_Organizer', function(Model, User, Api) {
		function Jam_Organizer(data) {
			if (data) {
				angular.extend(this, data);
			}

			if (this.user) {
				this.user = new User(this.user);
			}
		}

		Jam_Organizer.prototype.$save = function() {
			return this.$_save(
				'/jams/manage/jams/organizers/add-organizer/' + this.jam_id,
				'jamOrganizer',
			);
		};

		Jam_Organizer.prototype.$remove = function() {
			return this.$_remove(
				'/jams/manage/jams/organizers/remove-organizer/' + this.id,
			);
		};

		return Model.create(Jam_Organizer);
	});
