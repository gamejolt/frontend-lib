angular.module( 'gj.Scroll.FixedResizer' ).directive( 'gjScrollFixedResizer', function( $window, $document, $position, Scroll, Screen )
{
	function check( element, target )
	{
		if ( !target ) {
			return;
		}

		var targetOffset = $position.offset( target );
		var targetTop = targetOffset.top - $document.duScrollTop();

		if ( targetTop < Screen.windowHeight ) {

			var elemOffset = parseInt( $window.getComputedStyle( element[0] ).top, 10 );

			var newHeight = targetTop - elemOffset;
			if ( newHeight < 0 ) {
				newHeight = 0;
			}

			element[0].style.height = newHeight + 'px';
		}
		else {
			element[0].style.height = 'auto';
		}
	}

	return {
		controller: function( $scope, $element, $attrs, $interval )
		{
			var target = null;

			$attrs.$observe( 'gjScrollFixedResizer', function( _target )
			{
				target = angular.element( $window.document.getElementById( _target ) );
				check( $element, target );
			} );

			function boundCheck()
			{
				check( $element, target );
			}

			Scroll.setScrollSpy( $scope, boundCheck );
			Screen.setResizeSpy( $scope, boundCheck );
			$scope.$on( '$stateChangeSuccess', boundCheck );

			var interval = $interval( boundCheck, 1000 );
			$scope.$on( '$destroy', function()
			{
				$interval.cancel( interval );
			} );
		}
	};
} );
