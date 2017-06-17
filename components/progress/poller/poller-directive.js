angular.module('gj.Progress.Poller').directive('gjProgressPoller', function() {
	var POLL_INTERVAL = 5000;

	return {
		restrict: 'A',
		controller: function($scope, $interval, $attrs, $parse, Api) {
			var poller = null;
			var url = null;
			var onComplete = null;
			var onError = null;
			var pollInterval = POLL_INTERVAL;

			if ($attrs.progressPollerOnComplete) {
				onComplete = $parse($attrs.progressPollerOnComplete);
			}

			if ($attrs.progressPollerOnError) {
				onError = $parse($attrs.progressPollerOnError);
			}

			if ($attrs.progressPollerInterval) {
				pollInterval = $parse($attrs.progressPollerInterval)($scope);
			}

			$attrs.$observe('gjProgressPoller', function(_url) {
				url = _url;
			});

			poller = $interval(function() {
				if (!url) {
					return;
				}

				Api.sendRequest(url, null, { detach: true })
					.then(function(response) {
						if (response.status == 'complete' || response.status == 'error') {
							if (response.status == 'complete' && onComplete) {
								onComplete($scope, {
									$response: response,
								});
							} else if (response.status == 'error' && onError) {
								onError($scope, {
									$response: response,
								});
							}

							$interval.cancel(poller);
							poller = null;
						}
					})
					.catch(function(response) {
						if (onError) {
							onError($scope, {
								$response: response,
							});
						}
					});
			}, pollInterval);

			$scope.$on('$destroy', function() {
				if (poller) {
					$interval.cancel(poller);
				}
			});
		},
	};
});
