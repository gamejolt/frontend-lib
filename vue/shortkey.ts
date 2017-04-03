import Vue from 'vue';

export function bootstrapShortkey()
{
	if ( !GJ_IS_SSR ) {
		const VueShortkey = require( 'vue-shortkey' );
		Vue.use( VueShortkey, {
			prevent: [ 'input', 'textarea' ],
		} );
	}
}
