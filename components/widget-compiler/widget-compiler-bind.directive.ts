import { Directive, OnInit, Input, OnChanges, SimpleChanges, ElementRef } from '@angular/core';

@Directive({
	selector: '[gjWidgetCompilerBind]',
})
export class WidgetCompilerBindDirective implements OnInit, OnChanges
{
	@Input( 'gjWidgetCompilerBind' ) bind: string;
	@Input() wigetCompilerDisabled = false;

	constructor( private element: ElementRef ) { }

	ngOnInit()
	{
	}

	ngOnChanges( changes: SimpleChanges )
	{
		if ( changes['bind'] ) {
			const content: string = changes['bind'].currentValue;

			if ( !content ) {
				this.element.nativeElement.empty();
				return;
			}

			// if ( this.wigetCompilerDisabled ) {
				this.element.nativeElement.innerHTML = content;
			// }
			// else {
			// 	this.element.nativeElement.innerHTML = this.compiler.compile( scope, content );
			// }
		}
	}
}

// angular.module( 'gj.WidgetCompiler' ).directive( 'gjWidgetCompilerBind', function( $parse, WidgetCompiler )
// {
// 	return {
// 		restrict: 'A',
// 		link: function( scope, element, attrs )
// 		{
// 			var isDisabled = false;
// 			var content = null;

// 			if ( angular.isDefined( attrs.widgetCompilerDisabled ) ) {
// 				if ( attrs.widgetCompilerDisabled === '' ) {
// 					isDisabled = true;
// 				}
// 				else {
// 					scope.$watch( $parse( attrs.widgetCompilerDisabled ), function( _isDisabled )
// 					{
// 						isDisabled = _isDisabled;
// 						update();
// 					} );
// 				}
// 			}

// 			scope.$watch( attrs.gjWidgetCompilerBind, function( _content )
// 			{
// 				content = _content;
// 				update();
// 			} );

// 			function update()
// 			{
// 				if ( !content ) {
// 					element.empty();
// 					return;
// 				}

// 				if ( isDisabled ) {
// 					element.html( content );
// 				}
// 				else {
// 					element.empty().append( WidgetCompiler.compile( scope, content ) );
// 				}
// 			}
// 		}
// 	};
// } );
