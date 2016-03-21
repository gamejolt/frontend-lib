angular.module( 'gj.ExpandWhen' ).directive( 'gjExpandWhen', function( $timeout, $transition, $parse )
{
	return {
		restrict: 'EA',
		transclude: true,
		scope: true,
		// Outer div is for collapsing with animation.
		// Inner div is where the transclusion happens.
		// We also make sure to clearfix the inner div so that the collapser knows the correct height with margins/paddings and stuff.
		template: '<div collapse="isCollapsed"><div ng-if="isTranscluded" class="clearfix" ng-transclude></div></div>',
		link: {
			pre: function( scope, element, attrs )
			{
				var timeoutPromise, animationPromise;

				scope.isTranscluded = false;
				scope.isCollapsed = false;

				// This is the child div with the collapse directive on it.
				var collapsibleChild = element.children( 1 );

				/**
				 * When not yet primed, we will do everything without timeouts so that the state of the directive
				 * is set without animation on first load.
				 */
				var primed = false;
				function prime( shouldExpand )
				{
					scope.isTranscluded = shouldExpand;
					scope.isCollapsed = !shouldExpand;
					primed = true;

					if ( !scope.isCollapsed ) {
						element[0].classList.add( 'is-expanded' );
					}
				}

				/**
				 * This makes sure we clear out any transition animations or timeouts before proceeding
				 * with setting up another one.
				 */
				function clearTransition()
				{
					if ( timeoutPromise ) {
						$timeout.cancel( timeoutPromise );
						timeoutPromise = null;
					}

					if ( animationPromise ) {
						animationPromise.cancel();
						animationPromise = null;
					}
				}

				scope.$watch( attrs.gjExpandWhen, function( shouldExpand )
				{
					if ( shouldExpand ) {

						if ( !primed ) {
							prime( shouldExpand );
							return;
						}

						clearTransition();

						// Transclude as soon as possible.
						// This will get the correct height to expand out to.
						scope.isTranscluded = true;

						// This is a crappy hack, but we have to try to give the browser/DOM time to transclude
						// everything in place. Wait a bit and then do the expand animation.
						timeoutPromise = $timeout( function()
						{
							timeoutPromise = null;
							scope.isCollapsed = false;
							element[0].classList.add( 'is-expanded' );
						}, 100 );
					}
					else {

						if ( !primed ) {
							prime( shouldExpand );
							return;
						}

						clearTransition();

						// Try to match the delay of an expansion.
						// This is another crappy hack for when you have two expand-when elements on the page
						// and you expand one and collapse the other. They should animate at nearly the same time.
						timeoutPromise = $timeout( function()
						{
							timeoutPromise = null;

							// Start the collapsing animation.
							scope.isCollapsed = true;
							element[0].classList.remove( 'is-expanded' );

							// Collapse uses a transition to time the collapsing and then watches for the transition end event.
							// We'll do the same so that we can be sure to clean up the inner HTML right after the collapser
							// has finished transitioning.
							// Better than guessing with a timeout.
							animationPromise = $transition( collapsibleChild );

							// If we chain it in the assignment, then we lose the .cancel() method.
							animationPromise.then( function()
							{
								animationPromise = null;
								scope.isTranscluded = false;
							} );
						}, 100 );
					}
				} );
			}
		}
	};
} );
