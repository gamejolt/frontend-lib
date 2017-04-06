import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Subscription } from 'rxjs/Subscription';

import { Scroll, ScrollChange } from '../scroll.service';
import { Ruler } from '../../ruler/ruler-service';

// We set up a global listener instead of having each element setting up
// listeners.
let items: AppScrollInview[] = [];

let scrollTop = 0;
let scrollHeight = 0;
let scrollWindowHeight = 0;

let scrolled$: Subscription;
if ( !GJ_IS_SSR ) {

	// Bootstrap with current values.
	scrollTop = Scroll.getScrollTop();
	scrollHeight = Scroll.getScrollHeight();
	scrollWindowHeight = Scroll.getScrollWindowHeight();

	const onScroll = ( scroll: ScrollChange ) =>
	{
		// We only calculate the bounding box when scroll height changes. This
		// reduces the amount of reflows and what not.
		const shouldRecalcDimensions = scrollHeight !== scroll.scrollHeight

		scrollTop = scroll.top;
		scrollHeight = scroll.scrollHeight;
		scrollWindowHeight = scroll.height;

		for ( const item of items ) {

			if ( shouldRecalcDimensions ) {
				item.recalcBox();
			}

			item.check();
		}
	};

	scrolled$ = Scroll.scrollChanges.subscribe( onScroll );
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
		this.check();
		items.push( this );
	}

	destroyed()
	{
		const index = items.indexOf( this );
		if ( index !== -1 ) {
			items.splice( index, 1 );
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

	check()
	{
		let inView = true;
		if ( this.top > scrollTop + scrollWindowHeight ) {
			inView = false;
		}
		else if ( this.bottom < scrollTop ) {
			inView = false;
		}

		if ( inView !== this.inView ) {
			this.inView = inView;

			if ( this.inView ) {
				this.$emit( 'inview' );
			}
			else {
				this.$emit( 'outview' );
			}
		}
	}
}
