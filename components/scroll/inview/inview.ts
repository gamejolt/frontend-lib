import Vue from 'vue';
import { Component, Watch, Prop } from 'vue-property-decorator';
import { Subscription } from 'rxjs/Subscription';

import { Scroll, ScrollChange } from '../scroll.service';
import { Ruler } from '../../ruler/ruler-service';

// We set up a global listener instead of having each element setting up
// listeners.
let items: AppScrollInview[] = [];

let scrolled$: Subscription;
if ( !GJ_IS_SSR ) {
	scrolled$ = Scroll.scrollChanges.subscribe( onScroll );
}

let lastScrollHeight: number | undefined = undefined;
function onScroll( scroll: ScrollChange )
{
	for ( const item of items ) {

		// We only calculate the bounding box when scroll height changes. This
		// reduces the amount of reflows and what not.
		if ( lastScrollHeight !== scroll.scrollHeight ) {
			item.recalcBox();
		}

		let inView = true;
		if ( item.top > scroll.top + scroll.height ) {
			inView = false;
		}
		else if ( item.bottom < scroll.top ) {
			inView = false;
		}

		if ( inView !== item.inView ) {
			item.inView = inView;
		}
	}

	lastScrollHeight = scroll.scrollHeight;
}

@Component({})
export class AppScrollInview extends Vue
{
	@Prop( { type: Number, default: 0 } ) extraPadding: number;

	inView = false;

	top: number;
	bottom: number;

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

	recalcBox()
	{
		const offset = Ruler.offset( this.$el );
		this.top = offset.top - this.extraPadding;
		this.bottom = offset.top + offset.height + this.extraPadding;
	}
}
