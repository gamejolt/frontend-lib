import Vue from 'vue';

interface GrowlOptions {
	message?: string;
	title?: string;
	sticky?: boolean;
	onclick?: Function;
	icon?: string;
	component?: typeof Vue;
	props?: any;
}

export class Growl {
	title?: string;
	message?: string;
	component?: typeof Vue;
	props?: any;
	sticky: boolean;
	icon?: string;
	onclick?: Function;

	constructor(public id: number, public type: string, options: GrowlOptions) {
		this.title = options.title;
		this.message = options.message;
		this.component = options.component;
		this.props = options.props;
		this.sticky = !!options.sticky;
		this.icon = options.icon;
		this.onclick = options.onclick;
	}

	close() {
		const index = Growls.growls.findIndex(growl => growl.id === this.id);
		if (index !== -1) {
			Growls.remove(index);
		}
	}
}

export class Growls {
	static incrementer = 0;
	static growls: Growl[] = [];

	static add(data: GrowlOptions): void;
	static add(message: string, title?: string): void;
	static add() {
		const type = arguments[0];

		let options: GrowlOptions =
			typeof arguments[1] === 'object'
				? arguments[1]
				: { message: arguments[1], title: arguments[2] || undefined };

		if (!options.title) {
			if (type === 'error') {
				options.title = 'Oh no!';
			} else if (type === 'success') {
				options.title = 'Huzzah!';
			}
		}

		// If we're a client, we want to instead show this as a system notification.
		// We don't do this if the growl is a component-type.
		if (GJ_IS_CLIENT && !options.component) {
			return this.createSystemNotification(options);
		}

		++this.incrementer;
		const growl = new Growl(this.incrementer, type, options);
		this.growls.push(growl);
	}

	static remove(index: number) {
		this.growls.splice(index, 1);
	}

	private static createSystemNotification(options: GrowlOptions) {
		const notification = new (window as any).Notification(options.title, {
			body: options.message,
			icon: options.icon,
		});

		notification.onclick = (event: any) => {
			if (options.onclick) {
				options.onclick(event);
				notification.close();
			}
		};
	}

	// Convenience methods.
	static success(data: GrowlOptions): void;
	static success(message: string, title?: string): void;
	static success() {
		const args = Array.prototype.slice.call(arguments);
		args.unshift('success');
		Growls.add.apply(Growls, args);
	}

	static info(data: GrowlOptions): void;
	static info(message: string, title?: string): void;
	static info() {
		const args = Array.prototype.slice.call(arguments);
		args.unshift('info');
		Growls.add.apply(Growls, args);
	}

	static error(data: GrowlOptions): void;
	static error(message: string, title?: string): void;
	static error() {
		const args = Array.prototype.slice.call(arguments);
		args.unshift('error');
		Growls.add.apply(Growls, args);
	}
}
