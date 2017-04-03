import { AppBackdrop } from './backdrop';

export class Backdrop
{
	private static backdrops: AppBackdrop[] = [];

	static push()
	{
		const el = document.createElement( 'div' );
		document.body.appendChild( el );

		const backdrop = new AppBackdrop();
		backdrop.$mount( el );

		this.backdrops.push( backdrop );

		return backdrop;
	}

	static remove( backdrop: AppBackdrop )
	{
		backdrop.$destroy();
		backdrop.$el.parentNode!.removeChild( backdrop.$el );

		const index = this.backdrops.indexOf( backdrop );
		if ( index !== -1 ) {
			this.backdrops.splice( index, 1 );
		}
	}
}
