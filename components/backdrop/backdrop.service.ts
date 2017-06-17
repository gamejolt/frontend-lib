import { AppBackdrop } from './backdrop';

export class Backdrop {
	private static backdrops: AppBackdrop[] = [];

	static push(context?: HTMLElement) {
		const el = document.createElement('div');

		if (!context) {
			document.body.appendChild(el);
		} else {
			context.appendChild(el);
		}

		const backdrop = new AppBackdrop();
		backdrop.$mount(el);

		this.backdrops.push(backdrop);
		document.body.classList.add('backdrop-active');

		return backdrop;
	}

	static remove(backdrop: AppBackdrop) {
		backdrop.$destroy();
		backdrop.$el.parentNode!.removeChild(backdrop.$el);

		const index = this.backdrops.indexOf(backdrop);
		if (index !== -1) {
			this.backdrops.splice(index, 1);
		}

		if (this.backdrops.length === 0) {
			document.body.classList.remove('backdrop-active');
		}
	}
}
