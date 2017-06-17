import { ActivityStream } from './stream.service';

export class ActivityStreamSubscription {
	constructor(
		private primus: any,
		public id: number,
		public name: string,
		public input: any,
		public messageHandler: (message: any) => void,
	) {
		// Subscribe to the channel. If we aren't yet connected to the server,
		// primus will queue it up and send when we are.
		primus.write({
			event: 'channel-subscribe',
			name: this.name,
			input: this.input,
		});
	}

	unsubscribe() {
		this.primus.write({
			event: 'channel-unsubscribe',
			name: this.name,
			input: this.input,
		});

		// We have to let the main service know that this subscription is now
		// cleaned up.
		ActivityStream.subscriptionClosed(this);
	}
}
