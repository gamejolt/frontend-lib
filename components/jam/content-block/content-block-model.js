angular
	.module('gj.Jam.ContentBlock')
	.factory('Jam_ContentBlock', function($q, Model, Environment, Api) {
		function Jam_ContentBlock(data) {
			if (data) {
				angular.extend(this, data);
			}
		}

		Jam_ContentBlock.TYPE_HEADER = 'header';
		Jam_ContentBlock.TYPE_PAGE = 'page';

		Jam_ContentBlock.getBlock = function(blockId) {
			return Api.sendRequest(
				'/jams/manage/jams/content/get-block/' + blockId,
			).then(function(response) {
				return new Jam_ContentBlock(response.jamContentBlock);
			});
		};

		Jam_ContentBlock.prototype.getEditUrl = function(jam) {
			return jam.fullUrl + '#edit-content:' + this.id;
		};

		Jam_ContentBlock.prototype.$save = function() {
			return this.$_save(
				'/jams/manage/jams/content/save-block/' + this.id,
				'jamContentBlock',
			);
		};

		return Model.create(Jam_ContentBlock);
	});
