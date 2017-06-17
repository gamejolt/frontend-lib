angular
	.module('gj.UiTree.Placeholder')
	.directive('gjUiTreePlaceholder', function($interpolate, treeConfig) {
		var defaultPlaceholder = treeConfig.placeholderClass;

		// This is dumb!
		// Basically, ui-tree doesn't allow us to set the placeholder classes in the template,
		// so instead we have to set the treeConfig (which is a global config) and set it back
		// when the directive is destroyed.
		// NOTE: You can't use this with more than one component on a single page, since it's a global config.
		return {
			link: {
				pre: function(scope, element, attrs) {
					setPlaceholder($interpolate(attrs.gjUiTreePlaceholder)(scope));

					scope.$on('$destroy', function() {
						setPlaceholder('');
					});

					function setPlaceholder(placeholderClass) {
						treeConfig.placeholderClass =
							defaultPlaceholder + ' ' + placeholderClass;
					}
				},
			},
		};
	});
