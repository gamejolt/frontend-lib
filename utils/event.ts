
// Polyfill CustomEvent for stupid <IE11
if ( !GJ_IS_SSR && typeof (window as any).CustomEvent !== 'function' ) {

	function _CustomEvent( event: any, params: any )
	{
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		const evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	}

	_CustomEvent.prototype = (window as any).Event.prototype;
	(window as any).CustomEvent = _CustomEvent;
}

export function triggerEvent( el: HTMLElement, eventName: string, data?: any )
{
	if ( !GJ_IS_SSR ) {
		const event = new CustomEvent( eventName, { detail: data } );
		el.dispatchEvent( event );
	}
}
