angular
	.module('gj.Scroll.AutoScroll')
	.directive('gjAutoScroll', function(
		$q,
		$window,
		$document,
		$timeout,
		$parse,
		$position,
		AutoScroll,
		History,
		Scroll,
		$state,
		$transitions
	) {
		return {
			link: function(scope, element, attrs) {
				var startWatcher, successWatcher, stateWatcher, prevAnchor;

				function doScroll(to) {
					// Only do this if a no-scroll wasn't set.
					// This can be set by a directive that will cancel out the auto-scrolling behavior for one auto-scroll cycle.
					if (!AutoScroll.noScroll()) {
						// Check to see if we have a saved history state for the page we're going to.
						var state = AutoScroll.getState(to);
						if (History.inHistorical && state && state.scroll > 0) {
							// We need to let angular compile before attempting to scroll.
							// TODO: This causes a flicker of content before scrolling. Would be great to somehow get rid of this flicker.
							$timeout(
								function() {
									Scroll.to(state.scroll, { animate: false });
								},
								0,
								false
							);
						} else {
							$timeout(
								function() {
									var anchor = AutoScroll.anchor();
									if (anchor && anchor === prevAnchor) {
										// We only scroll to the anchor if they're scrolled past it currently.
										var offset = $position.offset(anchor);
										if (Scroll.getScrollTop() > offset.top - Scroll.offsetTop) {
											Scroll.to(offset.top, { animate: false });
										}
									} else {
										Scroll.to(0, { animate: false });
									}
								},
								0,
								false
							);
						}
					}

					// Clear out no-scroll that may be set now that we've gone to a new location.
					AutoScroll.noScroll(false);
				}

				function registerWatchers() {
					startWatcher = $transitions.onStart({}, function(trans) {
						prevAnchor = AutoScroll.anchor();
						if (trans.to()) {
							AutoScroll.pushState($state.href(trans.from(), trans.params('from')));
						}
					});

					successWatcher = $transitions.onSuccess({}, function(trans) {
						doScroll($state.href(trans.to(), trans.params('to')));
					});
				}

				function deregisterWatchers() {
					if (startWatcher) {
						startWatcher();
					}

					if (successWatcher) {
						successWatcher();
					}
				}

				// We only activate when the directive attribute evaluates to true.
				// Or if the directive as attached with no watch value.
				scope.$watch($parse(attrs.gjAutoScroll), function(isActive) {
					if (isActive || angular.isUndefined(isActive)) {
						registerWatchers();
					} else {
						deregisterWatchers();
					}
				});

				scope.$on('$destroy', function() {
					deregisterWatchers();
				});
			},
		};
	});
