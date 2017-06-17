import { Environment } from '../environment/environment.service';
import { appStore } from '../../vue/services/app/app-store';
import { EventBus } from '../event-bus/event-bus.service';

const ga: any =
	(typeof window !== 'undefined' && (window as any).ga) || function() {};

// Force HTTPS tracking beacons.
ga('set', 'forceSSL', true);

// Allow file:// and app:// protocols for Client or App.
// https://discuss.atom.io/t/google-analytics-in-atom-shell/14109/7
ga('set', 'checkProtocolTask', null);

export class Analytics {
	static readonly SOCIAL_NETWORK_FB = 'facebook';
	static readonly SOCIAL_NETWORK_TWITTER = 'twitter';
	static readonly SOCIAL_NETWORK_TWITCH = 'twitch';
	static readonly SOCIAL_NETWORK_YOUTUBE = 'youtube';

	static readonly SOCIAL_ACTION_LIKE = 'like';
	static readonly SOCIAL_ACTION_SHARE = 'share';
	static readonly SOCIAL_ACTION_SEND = 'send';
	static readonly SOCIAL_ACTION_TWEET = 'tweet';
	static readonly SOCIAL_ACTION_FOLLOW = 'follow';
	static readonly SOCIAL_ACTION_SUBSCRIBE = 'subscribe';
	static readonly SOCIAL_ACTION_UNSUBSCRIBE = 'unsubscribe';

	static extraTrackers: string[] = [];

	private static additionalPageTracker?: string;
	private static recordedPageView = true;

	static initRouter() {
		EventBus.on('routeChangeBefore', () => {
			this.recordedPageView = false;
		});

		EventBus.on('routeChangeAfter', () => {
			this.trackPageview();
		});
	}

	private static getAppUser() {
		return appStore.state.user;
	}

	private static ensureUserId() {
		const user = this.getAppUser();

		if (user && user.id) {
			if (Environment.buildType === 'development') {
				console.log(`Set tracking User ID: ${user.id}`);
			} else {
				ga('set', '&uid', user.id);
			}
		} else {
			if (Environment.buildType === 'development') {
				console.log('Unset tracking User ID.');
			} else {
				ga('set', '&uid', '');
			}
		}
	}

	private static shouldTrack() {
		const user = this.getAppUser();

		// If they're not a normal user, don't track.
		if (
			Environment.buildType === 'production' &&
			user &&
			user.permission_level > 0
		) {
			return false;
		}

		return true;
	}

	private static ga(...args: any[]) {
		if (GJ_IS_SSR) {
			return;
		}

		return new Promise(resolve => {
			let called = false;
			function cb() {
				if (!called) {
					called = true;
					resolve();
				}
			}

			// If we set hitCallback to true for the options of this call, then
			// we want to be alerted when the command is finished. We limit it
			// with a timeout in this case.
			const lastArg = args[args.length - 1];
			if (typeof lastArg === 'object' && lastArg.hitCallback) {
				// This will ensure that resolve() gets called at least within 1s.
				lastArg.hitCallback = cb;
				window.setTimeout(cb, 1000);
				ga.apply(null, args);
			} else {
				// Otherwise do it immediately.
				ga.apply(null, args);
				cb();
			}
		});
	}

	static trackPageview(path?: string) {
		if (GJ_IS_SSR) {
			return;
		}

		// Gotta make sure the system has a chance to compile the title into the page.
		window.setTimeout(() => {
			this._trackPageview(path);
		});
	}

	private static _trackPageview(path?: string, tracker = '') {
		if (!this.shouldTrack()) {
			console.log('Skip tracking page view since not a normal user.');
			return;
		}

		let method = 'send';

		// Did they pass in a tracker other than the default?
		if (tracker) {
			// Normalize.
			const normalizedTracker = tracker.replace(/[\-_:]/g, '');

			// Prefix the method with the tracker.
			method = normalizedTracker + '.' + method;

			// If we haven't added this tracker yet in GA, let's do so.
			if (this.extraTrackers.indexOf(tracker) === -1) {
				// Save that we have this tracker set.
				this.extraTrackers.push(tracker);

				// Now add it in GA.
				if (Environment.buildType === 'development') {
					console.log('Create new tracker: ' + tracker);
				} else {
					this.ga('create', tracker, 'auto', { name: normalizedTracker });
				}
			}
		}

		this.ensureUserId();

		// If no path passed in, then pull it from the location.
		if (!path) {
			path =
				window.location.pathname +
				window.location.search +
				window.location.hash;
		}

		// Pull the title.
		const title = window.document.title;

		const options = {
			page: path,
			title: title,
		};

		// Now track the page view.
		if (Environment.buildType === 'development') {
			console.log(
				`Track page view: tracker(${tracker}) | ${JSON.stringify(options)}`,
			);
		} else {
			this.ga(method, 'pageview', { ...options });
		}

		// If they have an additional page tracker attached, then track the page view for that tracker as well.
		if (!tracker && this.additionalPageTracker) {
			this._trackPageview(undefined, this.additionalPageTracker);
		}

		// Since this is the primary (not an additional tracker) set that we've recorded the page view.
		if (!tracker) {
			this.recordedPageView = true;
		}
	}

	static async trackEvent(
		category: string,
		action: string,
		label?: string,
		value?: string,
	) {
		if (!this.shouldTrack()) {
			console.log('Skip tracking event since not a normal user.');
			return;
		}

		this.ensureUserId();

		if (Environment.buildType === 'development') {
			console.log(
				`Track event: ${category}:${action || '-'}:${label || '-'}:${value ||
					'-'}`,
			);
		} else {
			const options = {
				nonInteraction: 1,
				hitCallback: true,
			};

			await this.ga('send', 'event', category, action, label, value, options);
		}
	}

	static async trackSocial(network: string, action: string, target: string) {
		if (!this.shouldTrack()) {
			console.log('Skip tracking social event since not a normal user.');
			return;
		}

		this.ensureUserId();

		if (Environment.buildType === 'development') {
			console.log(`Track social event: ${network}:${action}:${target}`);
		} else {
			this.ga('send', 'social', network, action, target, {
				hitCallback: true,
			});
		}
	}

	static async trackTiming(
		category: string,
		timingVar: string,
		value: number,
		label?: string,
	) {
		if (!this.shouldTrack()) {
			console.log('Skip tracking timing event since not a normal user.');
			return;
		}

		console.info(
			`Timing (${category}${label ? ':' + label : ''}) ${timingVar} = ${value}`,
		);

		if (Environment.buildType === 'production') {
			this.ga('send', 'timing', category, timingVar, value, label, {
				hitCallback: true,
			});
		}
	}

	static setCurrentExperiment(experiment: string, variation: string | number) {
		// If the chosen variation is -1, then they weren't chosen to run in this experiment, so we skip tracking.
		if (variation === -1 || variation === '-1') {
			return;
		}

		if (!this.shouldTrack()) {
			console.log('Skip setting experiment since not a normal user.');
			return;
		}

		if (Environment.buildType === 'development') {
			console.log(`Set new experiment: ${experiment} = ${variation}`);
		} else {
			ga('set', 'expId', experiment);
			ga('set', 'expVar', '' + variation);
		}
	}

	static attachAdditionalPageTracker(scope: any, trackingId: string) {
		if (!GJ_IS_ANGULAR) {
			throw new Error(`Can't attach addtional page trackers in vue yet.`);
		}

		if (Environment.buildType === 'development') {
			console.log(`Attached additional tracker: ${trackingId}`);
		}

		this.additionalPageTracker = trackingId;
		scope.$on('$destroy', () => {
			if (Environment.buildType === 'development') {
				console.log(`Detached additional tracker: ${trackingId}`);
			}
			this.additionalPageTracker = undefined;
		});

		// If we have already recorded the page view and we're adding the tracker, record the current page.
		// This ensures that if we add it in lazily it'll still record correctly.
		if (this.recordedPageView) {
			this._trackPageview(undefined, trackingId);
		}
	}
}
