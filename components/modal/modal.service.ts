import Vue, { AsyncComponent } from 'vue';
import { arrayRemove } from '../../utils/array';
import { makeObservableService } from '../../utils/vue';

type ModalComponent = typeof Vue | AsyncComponent<Vue>;

export interface ModalOptions {
	size?: 'sm' | 'lg' | 'full' | undefined;
	component: ModalComponent;
	props?: any;
	noBackdrop?: boolean;
	noBackdropClose?: boolean;
	noEscClose?: boolean;
}

export class Modal {
	static modals: Modal[] = [];
	static incrementer = 0;

	size: 'sm' | 'lg' | 'full' | undefined;
	component: ModalComponent;
	props?: any;
	noBackdrop?: boolean;
	noBackdropClose?: boolean;
	noEscClose?: boolean;

	get index() {
		return Modal.modals.findIndex(i => i === this);
	}

	static show<T>(options: ModalOptions) {
		return new Promise<T | undefined>(resolve => {
			++this.incrementer;
			const modal = new Modal(this.incrementer, resolve, options);
			this.modals.push(modal);
		});
	}

	static remove(modal: Modal) {
		arrayRemove(Modal.modals, item => item.id === modal.id);
	}

	constructor(public id: number, private _resolve: Function, options: ModalOptions) {
		this.size = options.size;
		this.component = options.component;
		this.props = options.props;
		this.noBackdrop = options.noBackdrop;
		this.noBackdropClose = options.noBackdropClose;
		this.noEscClose = options.noEscClose;
	}

	resolve(val?: any) {
		Modal.remove(this);
		this._resolve(val);
	}

	dismiss() {
		Modal.remove(this);
		this._resolve(undefined);
	}
}

makeObservableService(Modal);
