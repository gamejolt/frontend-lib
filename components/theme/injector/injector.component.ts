import { Component, OnInit, AfterViewInit, Input, ElementRef } from '@angular/core';

@Component({
	selector: 'gj-theme-injector',
	template: '',
})
export class ThemeInjectorComponent implements OnInit, AfterViewInit
{
	@Input() definition: any;
	@Input() theme: any;

	constructor(
		private element: ElementRef,
		// @Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		// @Inject( '$window' ) private $window: ng.IWindowService,
	)
	{
	}

	ngOnInit()
	{
		if ( window ) {
			window.addEventListener( 'message', ( event: MessageEvent ) =>
			{
				console.log( 'got msg', event.data );
				switch ( event.data.type ) {
					case 'theme-update': {

						if ( !event.data.theme || !event.data.themeDefinition ) {
							return;
						}

						this.refreshStyles( event.data.themeDefinition, event.data.theme );
						return;
					};
				}

			}, false );
		}
	}

	ngAfterViewInit()
	{
		this.refreshStyles( this.definition, this.theme );
	}

	private refreshStyles( themeDefinition: any, currentTheme: any )
	{
		let styles: string[] = [];
		let fonts: string[] = [];

		for ( const field in themeDefinition.definitions ) {
			if ( currentTheme && typeof currentTheme[field] !== 'undefined' && currentTheme[field] ) {
				const definition = themeDefinition.definitions[ field ];

				let propertyValue: string;
				if ( definition.type === 'image' ) {
					propertyValue = 'url("' + currentTheme[field] + '")';
				}
				else if ( definition.type === 'background-repeat' ) {
					if ( currentTheme[field] === 'repeat-x' ) {
						propertyValue = 'repeat-x';
					}
					else if ( currentTheme[field] === 'repeat-y' ) {
						propertyValue = 'repeat-y';
					}
					else if ( currentTheme[field] === 'no-repeat' ) {
						propertyValue = 'no-repeat';
					}
					else {
						propertyValue = 'repeat';
					}
				}
				else if ( definition.type === 'background-position' ) {
					if ( currentTheme[field] === 'topLeft' ) {
						propertyValue = 'top left';
					}
					else if ( currentTheme[field] === 'topRight' ) {
						propertyValue = 'top right';
					}
					else if ( currentTheme[field] === 'right' ) {
						propertyValue = 'center right';
					}
					else if ( currentTheme[field] === 'bottomRight' ) {
						propertyValue = 'bottom right';
					}
					else if ( currentTheme[field] === 'bottom' ) {
						propertyValue = 'bottom center';
					}
					else if ( currentTheme[field] === 'bottomLeft' ) {
						propertyValue = 'bottom left';
					}
					else if ( currentTheme[field] === 'left' ) {
						propertyValue = 'center left';
					}
					else if ( currentTheme[field] === 'middle' ) {
						propertyValue = 'center center';
					}
					else {
						propertyValue = 'top center';
					}
				}
				else if ( definition.type === 'fontFamily' ) {
					propertyValue = `'${currentTheme[field].family}'`;
					fonts.push( '@import url(//fonts.googleapis.com/css?family=' + currentTheme[field].family.replace( / /g, '+' ) + ');' );
				}
				else {
					propertyValue = currentTheme[field];
				}

				(definition.injections || [ definition ]).forEach( ( injection: any ) =>
				{
					// If no property, skip it.
					if ( !injection.property ) {
						return;
					}

					const rule = injection.selector + '{' + injection.property + ':' + propertyValue + '}';
					styles.push( rule );
				} );
			}
		}

		let stylesCompiled = styles.join( '' );

		// Put in font imports first.
		stylesCompiled = fonts.join( '' ) + stylesCompiled;

		console.log( styles );

		// Add it to the element.
		this.element.nativeElement.innerHTML = '<style>' + stylesCompiled + '</style>';
	}
}
