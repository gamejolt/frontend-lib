angular
	.module('gj.Jam.VotingCategory')
	.factory('Jam_VotingCategory', function($q, Model, Environment, Api) {
		function Jam_VotingCategory(data) {
			if (data) {
				angular.extend(this, data);
			}
		}

		Jam_VotingCategory.$saveSort = function(jamId, sortedIds) {
			return Api.sendRequest(
				'/jams/manage/jams/voting/save-sorted-categories/' + jamId,
				sortedIds,
			);
		};

		Jam_VotingCategory.prototype.$save = function() {
			// Are we adding or saving?
			if (!this.id) {
				return this.$_save(
					'/jams/manage/jams/voting/add-category/' + this.jam_id,
					'jamVotingCategory',
				);
			} else {
				return this.$_save(
					'/jams/manage/jams/voting/save-category/' + this.id,
					'jamVotingCategory',
				);
			}
		};

		Jam_VotingCategory.prototype.$remove = function() {
			return this.$_remove(
				'/jams/manage/jams/voting/remove-category/' + this.id,
			);
		};

		return Model.create(Jam_VotingCategory);
	});
