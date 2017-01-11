import { Component, Input, OnInit, Inject, Output } from 'ng-metadata/core';
import template from 'html!./theme-editor.component.html';
import { SiteTemplate } from '../../site/template/template-model';

interface StyleGroup {
	name: string;
	sections: {
		section: string;
		definitions: string[];
	}[];
}

@Component({
	selector: 'gj-theme-editor',
	template,
})
export class ThemeEditorComponent implements OnInit
{
	@Input( '@' ) windowId: string;
	@Input( '<' ) template: number;
	@Input( '<' ) theme: any;
	@Input( '<' ) resourceId: number;

	@Output() changed: Function;

	isLoaded = false;

	iframe: HTMLIFrameElement;

	templateObj: SiteTemplate;
	definition: any = {};
	selectedGroup: StyleGroup;

	private initialTheme: any = {};

	constructor(
		@Inject( 'Api' ) private api: any,
		@Inject( 'SiteTemplate' ) private templateModel: typeof SiteTemplate,
	)
	{
	}

	ngOnInit()
	{
		// Save the initial content, as well.
		this.initialTheme = angular.copy( this.theme );

		this.api.sendRequest( '/sites-io/get-template/' + this.template )
			.then( ( response: any ) =>
			{
				this.isLoaded = true;

				this.templateObj = new this.templateModel( response.template );
				this.definition = this.templateObj.data;
				this.selectedGroup = this.definition.styleGroups[0];

				// Make sure we update the page with the current theme.
				this.refresh();
			} );
	}

	refresh()
	{
		const iframe = document.getElementById( this.windowId ) as HTMLIFrameElement;
		if ( iframe ) {
			const msg = {
				type: 'theme-update',
				template: this.templateObj,
				definition: this.definition,
				theme: this.theme,
			};
			iframe.contentWindow.postMessage( msg, '*' );
		}

		this.changed( { $theme: this.theme } );
	}
}
