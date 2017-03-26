import Vue from 'vue';
import './tooltip.styl';

let AppTooltip: Vue.DirectiveOptions = {};
if ( !GJ_IS_SSR ) {
	AppTooltip = require( 'v-tooltip' ).VTooltip;
}

export { AppTooltip };
