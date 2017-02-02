angular.module( 'gj.Translate.LangSelector' ).directive( 'gjTranslateLangSelector', function( Analytics, Translate )
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./lang-selector.html' ),
		scope: {
			onLangChangeEvent: '&?onLangChange',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope )
		{
			var _this = this;

			$scope.Translate = Translate;

			this.lang = Translate.lang;
			this.onLangChange = function( newLang )
			{
				Analytics.trackEvent( 'translations', 'change', newLang ).then( function()
				{
					// We don't wait for the promise to resolve before firing the event.
					// This way they can reload the window without any language flicker.
					Translate.setLanguage( newLang );
					if ( _this.onLangChangeEvent ) {
						_this.onLangChangeEvent();
					}
				} );
			};
		}
	};
} );
