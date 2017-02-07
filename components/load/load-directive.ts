import { Directive, HostListener, Output, EventEmitter } from 'ng-metadata/core';

@Directive({
	selector: '[gj-load]',
})
export class LoadDirective
{
	@Output( 'gjLoad' ) private onLoad = new EventEmitter<ng.IAngularEvent>();

	@HostListener( 'load', [ '$event' ] )
	loaded( event: ng.IAngularEvent )
	{
		this.onLoad.emit( event );
	}
}
