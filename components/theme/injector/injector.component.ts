import { Component, Inject, OnInit, AfterViewInit, Input } from 'ng-metadata/core';

@Component({
	selector: 'gj-theme-injector',
	template: '<style></style>',
})
export class ThemeInjectorComponent implements OnInit, AfterViewInit
{
	@Input( '<' ) definition: any;
	@Input( '<' ) theme: any;

	styleElem: HTMLStyleElement;

	constructor(
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		@Inject( '$window' ) private $window: ng.IWindowService,
	)
	{
	}

	ngOnInit()
	{
		this.$window.addEventListener( 'message', ( event: MessageEvent ) =>
		{
			console.log( 'got msg', event.data );
			switch ( event.data.type ) {
				case 'theme-update': {

					if ( !event.data.theme || !event.data.definition ) {
						return;
					}

					this.refreshStyles( event.data.definition, event.data.theme );
					return;
				};
			}

		}, false );
	}

	ngAfterViewInit()
	{
		this.styleElem = this.$element[0].getElementsByTagName( 'style' )[0] as HTMLStyleElement;
		this.refreshStyles( this.definition, this.theme );
	}

	private refreshStyles( themeDefinition: any, currentTheme: any )
	{
		let styles: string[] = [];
		let fonts: string[] = [];

		angular.forEach( themeDefinition.definitions, ( definition: any, field: string ) =>
		{
			if ( currentTheme && typeof currentTheme[field] !== 'undefined' && currentTheme[field] ) {

				let propertyValue: string;
				if ( definition.type == 'image' ) {
					propertyValue = 'url("' + currentTheme[field] + '")';
				}
				else if ( definition.type == 'background-repeat' ) {
					if ( currentTheme[field] == 'repeat-x' ) {
						propertyValue = 'repeat-x';
					}
					else if ( currentTheme[field] == 'repeat-y' ) {
						propertyValue = 'repeat-y';
					}
					else if ( currentTheme[field] == 'no-repeat' ) {
						propertyValue = 'no-repeat';
					}
					else {
						propertyValue = 'repeat';
					}
				}
				else if ( definition.type == 'background-position' ) {
					if ( currentTheme[field] == 'topLeft' ) {
						propertyValue = 'top left';
					}
					else if ( currentTheme[field] == 'topRight' ) {
						propertyValue = 'top right';
					}
					else if ( currentTheme[field] == 'right' ) {
						propertyValue = 'center right';
					}
					else if ( currentTheme[field] == 'bottomRight' ) {
						propertyValue = 'bottom right';
					}
					else if ( currentTheme[field] == 'bottom' ) {
						propertyValue = 'bottom center';
					}
					else if ( currentTheme[field] == 'bottomLeft' ) {
						propertyValue = 'bottom left';
					}
					else if ( currentTheme[field] == 'left' ) {
						propertyValue = 'center left';
					}
					else if ( currentTheme[field] == 'middle' ) {
						propertyValue = 'center center';
					}
					else {
						propertyValue = 'top center';
					}
				}
				else if ( definition.type == 'fontFamily' ) {
					propertyValue = "'" + currentTheme[field].family + "'";
					fonts.push( '@import url(//fonts.googleapis.com/css?family=' + currentTheme[field].family.replace( / /g, '+' ) + ');' );
				}
				else {
					propertyValue = currentTheme[field];
				}

				_.forEach( definition.injections || [ definition ], function( injection )
				{
					// If no property, skip it.
					if ( angular.isUndefined( injection.property ) ) {
						return;
					}

					var rule = injection.selector + '{' + injection.property + ':' + propertyValue + '}';
					styles.push( rule );
				} );
			}
		} );

		let stylesCompiled = styles.join( '' );

		// Put in font imports first.
		stylesCompiled = fonts.join( '' ) + stylesCompiled;

		// Add it to the element.
		this.styleElem.innerHTML = stylesCompiled;
	}
}
