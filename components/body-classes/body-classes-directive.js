angular.module( 'gj.BodyClasses' ).directive( 'gjBodyClasses', function( $state )
{
	return {
		restrict: 'A',
		link: function( scope, element )
		{
			var _currentClasses = [];

			function onStateChange( stateName )
			{
				if ( stateName && angular.isString( stateName ) ) {

					var bodyClass = stateName.replace( '-', '' ).replace( /\./g, '-' ).toLowerCase();

					var newClasses = [];
					var pieces = bodyClass.split( '-' );
					var currentPrefix = 'ctrl';
					for ( var i = 0; i < pieces.length; ++i ) {
						currentPrefix += '-' + pieces[i];
						newClasses.push( currentPrefix );
					}

					newClasses.push( currentPrefix + '-page' );

					if ( _currentClasses.length ) {
						element.removeClass( _currentClasses.join( ' ' ) );
					}

					_currentClasses = newClasses;
					element.addClass( _currentClasses.join( ' ' ) );
				}
			}

			scope.$on( '$stateChangeSuccess', function( event, toState )
			{
				onStateChange( toState.name );
			} );
		}
	};
} );
