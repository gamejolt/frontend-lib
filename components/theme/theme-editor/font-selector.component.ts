import { Component, Inject, OnInit, Self } from 'ng-metadata/core';
import { NgModel } from 'ng-metadata/common';
import template from 'html!./font-selector.component.html';

interface FontDefinition {
	family: string;
	files: {
		regular: string;
	};
}

@Component({
	selector: 'gj-theme-editor-font-selector',
	template,
})
export class ThemeEditorFontSelectorComponent implements OnInit
{
	selectedFont?: FontDefinition = undefined;

	isSelectorShowing = false;

	fontList: FontDefinition[] = [];
	fontListFiltered: FontDefinition[] = [];
	visibleFontCount = 50;
	fontListFilter = '';

	fontDefinitions = '';
	loadedFonts: string[] = [];

	constructor(
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( 'filterFilter' ) private filterFilter: ng.IFilterFilter,
		@Inject( 'Api' ) private api: any,
		@Inject( NgModel ) @Self() private ngModel: NgModel,
	)
	{
	}

	ngOnInit()
	{
		// Copy to our value when the model changes.
		this.ngModel.$render = () =>
		{
			this.selectedFont = this.ngModel.$viewValue || null;
			this.updateFontDefinitions();
		};
	}

	toggleSelector()
	{
		this.isSelectorShowing = !this.isSelectorShowing;
		if ( !this.isSelectorShowing ) {
			this.fontListFilter = '';
			this.filterFontList();
		}
		else {

			// On first showing, load the font list.
			if ( !this.fontList.length ) {
				this.getFontList()
					.then( ( fontList: FontDefinition[] ) =>
					{
						// Store the new font list.
						this.fontList = fontList;

						// Filter the font list with our current filters.
						this.filterFontList();
					} );
			}

			const fontListElement = angular.element( this.$element[0].querySelector( '.font-selector-font-list' ) );
			const liHeight = 38;
			const listHeight = 300;

			fontListElement.on( 'scroll', _.throttle( () =>
			{
				const scrollTop = fontListElement.scrollTop();
				const scrolledItemsCalculated = (scrollTop + listHeight) / liHeight;

				if ( this.visibleFontCount - scrolledItemsCalculated < 25 ) {
					this.$scope.$apply( () =>
					{
						this.visibleFontCount += 50;
						this.filterFontList();
					} );
				}
			}, 250 ) );
		}
	}

	selectFont( font: FontDefinition )
	{
		this.selectedFont = font;
		this.toggleSelector();
		this.persistSelectedFont();
	}

	clearSelectedFont()
	{
		this.selectedFont = undefined;
		this.persistSelectedFont();
	}

	filterFontList()
	{
		// Filter based on the filter text they enter in.
		this.fontListFiltered = this.filterFilter( this.fontList, { family: this.fontListFilter } );

		// Limit to only seeing the number of fonts our current "page" will allow.
		this.fontListFiltered = this.fontListFiltered.slice( 0, this.visibleFontCount );

		// Now that we've filtered the fonts, let's update which font definitions need to be loaded in.
		this.updateFontDefinitions();
	}

	private persistSelectedFont()
	{
		this.ngModel.$setViewValue( this.selectedFont );
	}

	private getFontList(): any
	{
		return this.api.sendRequest( '/jams/manage/jams/theme/get-font-list', null, { detach: true, processPayload: false } )
			.then( ( response: any ) =>
			{
				if ( response.data && angular.isDefined( response.data.items ) ) {
					return response.data.items;
				}
				return [];
			} );
	}

	private makeFontDefinitionString( font: FontDefinition ): string
	{
		// Only support showing regular font styles for now.
		if ( font.files.regular ) {
			return "@font-face { font-family: '" + font.family + "::Selector'; font-style: normal; font-weight: 400; src: url(" + font.files.regular + ") format('truetype'); }";
		}

		return '';
	}

	private updateFontDefinitions()
	{
		let newDefinitions: string[] = [];

		// Make sure our selected font's definition is loaded so it's styled correctly.
		if ( this.selectedFont ) {
			if ( this.loadedFonts.indexOf( this.selectedFont.family ) === -1 ) {
				newDefinitions.push( this.makeFontDefinitionString( this.selectedFont ) );
				this.loadedFonts.push( this.selectedFont.family );
			}
		}

		// Loop through our filtered font list and add in any new definitions that need to be loaded.
		if ( this.isSelectorShowing ) {
			this.fontListFiltered.forEach( ( font: FontDefinition ) =>
			{
				if ( this.loadedFonts.indexOf( font.family ) === -1 ) {
					newDefinitions.push( this.makeFontDefinitionString( font ) );
					this.loadedFonts.push( font.family );
				}
			} );
		}

		this.fontDefinitions += newDefinitions.join( '' );
	}
}
