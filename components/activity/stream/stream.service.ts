import { Environment } from '../../environment/environment.service';
import { Primus } from '../../primus/primus.service';
import { ActivityStreamSubscription } from './subscription.service';

export class ActivityStream {
	private static primus: any;
	private static connectionPromise: Promise<any>;

	private static isInitialized = false;
	private static subscriptions: {
		[k: number]: ActivityStreamSubscription;
	} = {};
	private static subscriptionCounter = 0;

	private static async ensureConnection() {
		// If we're prerendering, then we can't create a websocket connection or
		// it'll never finish the request.
		if (Environment.isPrerender || GJ_IS_SSR) {
			throw new Error(`Can't connect to stream if server-side rendering.`);
		}

		this.primus = await Primus.createConnection(Environment.activityStreamHost);

		// On new connection or reconnection to the server.
		this.primus.on('open', () => {
			// If we've already initialized the connection before, then this is
			// a reconnection. In this case we need to resubscribe to our
			// channels.
			if (this.isInitialized) {
				for (const subscription of Object.values<ActivityStreamSubscription>(this.subscriptions)) {
					this.primus.write({
						event: 'channel-subscribe',
						name: subscription.name,
						input: subscription.input,
					});
				}
			}

			this.isInitialized = true;
		});

		// On any data received send it off to all message handlers of all
		// subscriptions.
		this.primus.on('data', (message: any) => {
			for (const subscription of Object.values<ActivityStreamSubscription>(this.subscriptions)) {
				subscription.messageHandler(message);
			}
		});

		return this.primus;
	}

	static async subscribe(
		name: string,
		input: any,
		messageHandler: (message: any) => void,
		onConnected?: () => void
	) {
		// We just ensure once, then we use the promise on subsequent
		// subscribes.
		if (!this.connectionPromise) {
			this.connectionPromise = this.ensureConnection();
		}

		const primus = await this.connectionPromise;

		if (onConnected) {
			onConnected();
		}

		++this.subscriptionCounter;
		const subscription = new ActivityStreamSubscription(
			primus,
			this.subscriptionCounter,
			name,
			input,
			messageHandler
		);

		this.subscriptions[this.subscriptionCounter] = subscription;

		return subscription;
	}

	/**
	 * This is a callback that subscriptions use to let us know that they are
	 * closed.
	 */
	static subscriptionClosed(subscription: ActivityStreamSubscription) {
		delete this.subscriptions[subscription.id];
	}
}
