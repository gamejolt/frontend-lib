import { Component, Input, OnInit, Output, EventEmitter } from 'ng-metadata/core';
import * as template from '!html-loader!./theme-editor.component.html';

import { SiteTemplate } from '../../site/template/template-model';
import { Api } from '../../api/api.service';
import { Loader } from '../../loader/loader.service';

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
	@Input() windowId: string;
	@Input() template: number;
	@Input() theme: any;
	@Input() resourceId: number;

	@Output() private changed = new EventEmitter<any>();

	isLoaded = false;

	iframe: HTMLIFrameElement;

	templateObj: SiteTemplate;
	definition: any = {};
	selectedGroup: StyleGroup;

	Loader = Loader;

	private initialTheme: any = {};

	async ngOnInit()
	{
		Loader.load( 'spectrum' );

		// Save the initial content, as well.
		this.initialTheme = angular.copy( this.theme );

		const response = await Api.sendRequest( '/sites-io/get-template/' + this.template, undefined, {
			detach: true,
		} );

		this.isLoaded = true;

		this.templateObj = new SiteTemplate( response.template );
		this.definition = this.templateObj.data;
		this.selectedGroup = this.definition.styleGroups[0];

		// Make sure we update the page with the current theme.
		this.refresh( true );
	}

	refresh( initial = false )
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

		if ( !initial ) {
			this.changed.emit( this.theme );
		}
	}
}
