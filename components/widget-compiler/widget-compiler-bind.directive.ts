import { Directive, Inject, Input, OnChanges, OnInit } from 'ng-metadata/core';

import { WidgetCompiler } from './widget-compiler-service';

@Directive({
	selector: 'gj-widget-compiler-bind',
})
export class WidgetCompilerBindComponent implements OnInit, OnChanges
{
	@Input( '<gjWidgetCompilerBind' ) content = '';
	@Input( '<widgetCompilerDisabled' ) isDisabled = false;
	@Input( '<widgetCompilerScope' ) contextScope: ng.IScope;

	constructor(
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		@Inject( 'WidgetCompiler' ) private compiler: WidgetCompiler,
	)
	{
	}

	ngOnInit()
	{
		// this.$scope.$new( true, )
	}

	ngOnChanges()
	{
		this.update();
	}

	private update()
	{
		if ( !this.content ) {
			this.$element.empty();
			return;
		}

		if ( this.isDisabled ) {
			this.$element.html( this.content );
		}
		else {
			const compiledElem = this.compiler.compile( this.contextScope || this.$scope, this.content );
			if ( compiledElem ) {
				this.$element.empty().append( compiledElem );
			}
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
