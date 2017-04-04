import Vue from 'vue';

export interface ModalOptions
{
	size?: 'sm' | 'lg' | undefined;
	component: typeof Vue;
	props?: any;
	noBackdropClose?: boolean;
	noEscClose?: boolean;
}

export class Modal
{
	static modals: Modal[] = [];
	static incrementer = 0;

	size: 'sm' | 'lg' | undefined;
	component: typeof Vue;
	props?: any;
	noBackdropClose?: boolean;
	noEscClose?: boolean;

	static show( options: ModalOptions )
	{
		return new Promise<any>( ( resolve, reject ) =>
		{
			++this.incrementer;
			const modal = new Modal( this.incrementer, resolve, reject, options );
			this.modals.push( modal );
		} );
	}

	static remove( modal: Modal )
	{
		const index = Modal.modals.findIndex( ( item ) => item.id === modal.id );
		if ( index !== -1 ) {
			Modal.modals.splice( index, 1 );
		}
	}

	constructor(
		public id: number,
		private _resolve: Function,
		private _reject: Function,
		options: ModalOptions,
	)
	{
		this.size = options.size;
		this.component = options.component;
		this.props = options.props;
		this.noBackdropClose = options.noBackdropClose;
		this.noEscClose = options.noEscClose;
	}

	resolve( val?: any )
	{
		Modal.remove( this );
		this._resolve( val );
	}

	dismiss()
	{
		Modal.remove( this );
		this._reject();
	}
}
