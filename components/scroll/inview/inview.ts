import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Subscription } from 'rxjs/Subscription';

import { Scroll, ScrollChange } from '../scroll.service';
import { Ruler } from '../../ruler/ruler-service';

// We set up a global listener instead of having each element setting up
// listeners.
let items: AppScrollInview[] = [];
let lastCheck = Date.now();

let scrolled$: Subscription;
if ( !GJ_IS_SSR ) {
	scrolled$ = Scroll.scrollChanges.subscribe( onScroll );
}

function onScroll( scroll: ScrollChange )
{
	// Debounce this.
	const now = Date.now();
	if ( now - lastCheck < 250 ) {
		return;
	}

	lastCheck = now;

	for ( const item of items ) {

		let inView = true;
		const offset = Ruler.offset( item.$el );
		if ( offset.top > scroll.top + scroll.height ) {
			inView = false;
		}
		else if ( offset.top + offset.height < scroll.top ) {
			inView = false;
		}

		if ( inView !== item.inView ) {
			item.inView = inView;
		}
	}
}

@Component({})
export class AppScrollInview extends Vue
{
	inView = false;

	mounted()
	{
		this.inViewChanged();
		items.push( this );
	}

	destroyed()
	{
		const index = items.indexOf( this );
		if ( index !== -1 ) {
			items.splice( index, 1 );
		}
	}

	@Watch( 'inView' )
	inViewChanged()
	{
		if ( this.inView ) {
			this.$emit( 'inview' );
		}
		else {
			this.$emit( 'outview' );
		}
	}

	render( h: Vue.CreateElement )
	{
		return h( 'div', this.$slots.default );
	}
}
