import { Directive, HostListener, Output } from '@angular/core';

@Directive({
	selector: '[gj-load]',
})
export class LoadDirective
{
	@Output( 'gjLoad' ) onLoad: Function;

	@HostListener( 'load', [ '$event' ] )
	loaded( event: angular.IAngularEvent )
	{
		this.onLoad( { $event: event } );
	}
}
