angular.module( 'gj.Growls' ).directive( 'gjGrowlMessage', function( $timeout, $transition, Screen, Growls )
{
	return {
		restrict: 'A',
		templateUrl: '/lib/gj-lib-client/components/growls/growl-message.html',
		scope: {
			message: '=gjGrowlMessage',
			index: '=gjGrowlIndex',
		},
		compile: function( element )
		{
			if ( !Screen.isXs ) {
				element[0].classList.add( 'growl', 'anim-fade-enter-left', 'anim-fade-leave-left' );
			}
			else {
				element[0].classList.add( 'growl', 'anim-fade-enter-down', 'anim-back-leave-down' );
			}

			return function link( scope, $element, attrs )
			{
				var elem = $element[0];
				elem.classList.add( 'growl-type-' + scope.message.type );

				var leavePromise;

				/**
				 * After a certain amount of time has elapsed, we want to remove the growl message.
				 */
				function setLeaveTimer()
				{
					// We store the promise so we can cancel.
					leavePromise = $timeout( function()
					{
						scope.remove();
					}, 2500 );
				}

				/**
				 * Cancel the leave timer if there is one set.
				 */
				function cancelLeave()
				{
					// Only if active.
					if ( leavePromise ) {
						$timeout.cancel( leavePromise );
						leavePromise = undefined;
					}
				}

				if ( scope.message.sticky ) {
					elem.classList.add( 'growl-sticky' );
				}
				else {
					setLeaveTimer();
					scope.onMouseover = cancelLeave;
					scope.onMouseout = setLeaveTimer;
				}

				// When they click on the element, never auto-leave again.
				// They must explictly close it after that.
				scope.onClick = function( $event )
				{
					if ( scope.message.onclick ) {
						scope.message.onclick( $event );
						scope.remove( $event );
					}
				};

				/**
				 * Tells the Growl service to remove the message.
				 */
				scope.remove = function( $event )
				{
					if ( $event ) {
						$event.stopPropagation();
					}

					// Remove from the messages list.
					scope.message.close();
				};
			};
		}
	};
} );
