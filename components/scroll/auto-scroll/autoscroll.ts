import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';

import { Scroll } from '../scroll.service';
import { History } from '../../history/history.service';
import { Ruler } from '../../ruler/ruler-service';
import { AppAutoscrollAnchor } from './anchor';
import { Autoscroll } from './autoscroll.service';
import { makeObservableService } from '../../../utils/vue';

// interface AutoscrollState
// {
// 	key: any;
// 	scroll: number;
// }

@Component({})
export class AppAutoscroll extends Vue {
	// private prevAnchor?: AppAutoscrollAnchor;
	// private states: AutoscrollState[] = [];

	// private height: string | null = null;

	Autoscroll = makeObservableService(Autoscroll);

	// mounted()
	// {
	// 	this.$router.beforeEach( ( _to, _from, next ) =>
	// 	{
	// 		console.log( 'route before' );
	// 		if ( _from ) {
	// 			this.routeChangeBefore( _to, _from );
	// 		}
	// 		next();
	// 	} );

	// 	this.$router.afterEach( ( to ) =>
	// 	{
	// 		console.log( 'route after' );
	// 		this.routeChangeAfter( to );
	// 	} );

	// 	// EventBus.on( 'routeChangeBefore', ( _route: VueRouter.Route ) =>
	// 	// 	this.routeChangeBefore()
	// 	// );

	// 	// EventBus.on( 'routeChangeAfter', () =>
	// 	// 	this.routeChangeAfter()
	// 	// );
	// }

	render(h: Vue.CreateElement) {
		return h(
			'div',
			{
				style: {
					height: this.Autoscroll.height,
				},
			},
			this.$slots.default
		);
	}

	// private routeChangeBefore( to: VueRouter.Route, from: VueRouter.Route )
	// {
	// 	const scroll = Scroll.getScrollTop();
	// 	// this.prevAnchor = Scroll.autoscrollAnchor;

	// 	const fromState = this.getState( from.fullPath );
	// 	if ( fromState ) {
	// 		fromState.scroll = scroll;
	// 		console.log( 'modify state', fromState );
	// 	}
	// 	else {
	// 		this.states.push( {
	// 			key: from.fullPath,
	// 			scroll,
	// 		} );

	// 		console.log( 'add new state', this.states );
	// 	}

	// 	const toState = this.getState( to.fullPath );
	// 	if ( toState && toState.scroll ) {
	// 		this.height = toState.scroll + 'px';
	// 	}

	// 	// const state = this.getState( to.fullPath );
	// 	// if ( state ) {
	// 	// 	state.scroll = scroll;
	// 	// 	console.log( 'modify state', state );
	// 	// }
	// 	// else {
	// 	// 	this.states.push( {
	// 	// 		key: route.fullPath,
	// 	// 		scroll,
	// 	// 	} );

	// 	// 	console.log( 'add new state', this.states );
	// 	// }
	// }

	// // private updateScroll( route: VueRouter.Route )
	// // {
	// // 	const state = this.getState( to.fullPath );
	// // 	if ( state ) {
	// // 		state.scroll = scroll;
	// // 		console.log( 'modify state', state );
	// // 	}
	// // 	else {
	// // 		this.states.push( {
	// // 			key: route.fullPath,
	// // 			scroll,
	// // 		} );

	// // 		console.log( 'add new state', this.states );
	// // 	}
	// // }

	// private async routeChangeAfter( route: VueRouter.Route )
	// {
	// 	// this.height = null;
	// 	// if ( Scroll.shouldAutoScroll ) {

	// 	// 	// Gotta wait for DOM to compile.
	// 	// 	await this.$nextTick();

	// 	// 	// Check to see if we have a saved history state for the page we're
	// 	// 	// going to.
	// 	// 	const state = this.getState( route.fullPath );
	// 	// 	if ( History.inHistorical && state && state.scroll > 0 ) {

	// 	// 		console.log( 'scroll historical', state.scroll );

	// 	// 		Scroll.to( state.scroll, { animate: false } );
	// 	// 	}
	// 	// 	// No saved state.
	// 	// 	else {
	// 	// 		const anchor = Scroll.autoscrollAnchor;
	// 	// 		if ( anchor && this.prevAnchor && anchor.scrollKey === this.prevAnchor.scrollKey ) {

	// 	// 			// We only scroll to the anchor if they're scrolled past it currently.
	// 	// 			const offset = Ruler.offset( anchor.$el );
	// 	// 			if ( Scroll.getScrollTop() > offset.top - Scroll.offsetTop ) {
	// 	// 				Scroll.to( offset.top - Scroll.offsetTop, { animate: false } );
	// 	// 			}
	// 	// 		}
	// 	// 		else {
	// 	// 			Scroll.to( 0, { animate: false } );
	// 	// 		}
	// 	// 	}
	// 	// }

	// 	// // Reset.
	// 	// Scroll.shouldAutoScroll = true;
	// }

	// private getState( key: any )
	// {
	// 	console.log( 'try to get state', key );
	// 	return this.states.find( ( item ) => item.key === key );
	// }

	// // $rootScope.$watch( function()
	// // {
	// // 	return $location.hash();
	// // },
	// // function( newVal, oldVal )
	// // {
	// // 	if ( newVal === oldVal && newVal === '' ) {
	// // 		return;
	// // 	}

	// // 	$timeout( function()
	// // 	{
	// // 		if ( $document[0].getElementById( newVal ) ) {
	// // 			Scroll.to( newVal );
	// // 		}
	// // 	}, 50, false );
	// // } );
}
