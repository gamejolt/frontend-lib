import { Injectable, Inject } from 'ng-metadata/core';
import { State } from 'angular-ui-router';

@Injectable('ConnectionStatePermissions')
export class ConnectionStatePermissions {
	currentState?: State;

	constructor(@Inject('$rootScope') private $rootScope: ng.IRootScopeService) {}

	init() {
		/**
		 * We need to keep track of the currently transitioning state.
		 * This way on a payload failure in the Payload service we can see if we should still
		 * allow the state to transition successfully.
		 */
		this.$rootScope.$on(
			'$stateChangeStart',
			(_event: ng.IAngularEvent, toState: State) => {
				this.setCurrentState(toState);
			},
		);

		this.$rootScope.$on('$stateChangeSuccess', () => {
			this.clearCurrentState();
		});

		this.$rootScope.$on('$stateChangeError', () => {
			this.clearCurrentState();
		});

		/**
		 * When a payload fails, check to see if it was because of an offline error.
		 * If so, we need to check if they are allowed to access the state while offline.
		 */
		this.$rootScope.$on(
			'Payload.responseError',
			(event: ng.IAngularEvent, response: any, requestOptions: any) => {
				// We want to process offline, timed out, or aborted requests.
				if (response.status != -1) {
					return;
				}

				// Let's check to see if we're allowed to transition to this state even while offline.
				if (
					!requestOptions.detach &&
					!requestOptions.noOfflineStateCheck &&
					this.allowedOffline()
				) {
					// We prevent default, which tells the Payload service to return a success
					// even though the response failed.
					// This way the route will still resolve.
					event.preventDefault();
				}
			},
		);
	}

	setCurrentState(state: State) {
		this.currentState = state;
	}

	clearCurrentState() {
		this.currentState = undefined;
	}

	/**
	 * Returns whether or not the state we're currently transitioning to allows offline mode.
	 */
	allowedOffline() {
		// If we're not currently transitioning to a new state, then ignore this.
		// This is usually matters for non detached API requests.
		if (!this.currentState) {
			return false;
		}

		if (!this.currentState.data || !this.currentState.data.availableOffline) {
			return false;
		}

		return true;
	}
}
