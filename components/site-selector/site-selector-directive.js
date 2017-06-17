angular.module('gj.SiteSelector').directive('gjSiteSelector', function() {
	return {
		restrict: 'E',
		template: require('!html-loader!./site-selector.html'),
		scope: {},
		bindToController: {
			currentSite: '@siteSelectorCurrent',
			shouldHideLogo: '=?siteSelectorHideLogo',
		},
		controllerAs: 'ctrl',
		controller: function($scope, Environment) {
			$scope.Environment = Environment;

			this.isPopoverActive = false;

			this.url = '';
			if (this.currentSite == 'main') {
				this.url = Environment.wttfBaseUrl + '/';
			} else if (this.currentSite == 'fireside') {
				this.url = Environment.firesideBaseUrl;
			} else if (this.currentSite == 'jams') {
				this.url = Environment.jamsBaseUrl;
			} else if (this.currentSite == 'dev') {
				this.url = Environment.devBaseUrl;
			}
		},
	};
});
