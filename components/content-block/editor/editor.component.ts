import { Component, Input, Inject, OnInit } from 'ng-metadata/core';
import * as template from '!html-loader!./editor.component.html';

import { SiteContentBlock } from '../../site/content-block/content-block-model';
import { Environment } from '../../environment/environment.service';
import { Api } from '../../api/api.service';

const PREVIEW_DEBOUNCE = 2000;

@Component( {
	selector: 'gj-content-block-editor',
	template,
})
export class ContentBlockEditorComponent implements OnInit
{
	@Input( '@' ) windowId: string;
	@Input( '<' ) contentBlock: SiteContentBlock;

	isPreviewLoading = false;
	private previewIndex = 0;
	private fetchPreview: Function;

	env = Environment;

	constructor(
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
	)
	{
	}

	ngOnInit()
	{
		this.fetchPreview = _.debounce( () => this._fetchPreview(), PREVIEW_DEBOUNCE );

		this.$scope.$watch( '$ctrl.contentBlock.content_markdown', ( content: string ) =>
		{
			if ( content ) {
				this.isPreviewLoading = true;
				this.fetchPreview();
			}
			else {
				this.isPreviewLoading = false;
				this.compiled( '' );
			}
		} );
	}

	private _fetchPreview()
	{
		const previewIndex = ++this.previewIndex;
		Api.sendRequest( '/web/dash/sites/content-preview', { content: this.contentBlock.content_markdown }, { ignorePayloadUser: true } )
			.then( ( response: any ) =>
			{
				if ( previewIndex === this.previewIndex ) {
					this.isPreviewLoading = false;
					if ( response && response.success !== false && response.compiled ) {
						this.compiled( response.compiled );
					}
				}
			} );
	}

	compiled( compiledContent: string )
	{
		this.contentBlock.content_compiled = compiledContent;
		this.refresh();
	}

	refresh()
	{
		const iframe = document.getElementById( this.windowId ) as HTMLIFrameElement;
		if ( iframe ) {
			const msg = {
				type: 'content-update',
				block: this.contentBlock,
			};
			iframe.contentWindow.postMessage( msg, '*' );
		}
	}

	// Pulled from: http://stackoverflow.com/questions/1064089/inserting-a-text-where-cursor-is-using-javascript-jquery
	insertAtCaret( text: string )
	{
		const txtarea = this.$element[0].getElementsByTagName( 'textarea' )[0];
		if ( !txtarea ) {
			return;
		}

		const scrollPos = txtarea.scrollTop;
		let strPos = 0;
		const br = ( ( txtarea.selectionStart || txtarea.selectionStart == 0 ) ?
			'ff' : ( document.selection ? 'ie' : false ) );

		if ( br === 'ie' ) {
			txtarea.focus();
			var range = document.selection.createRange();
			range.moveStart( 'character', -txtarea.value.length );
			strPos = range.text.length;
		}
		else if ( br === 'ff' ) {
			strPos = txtarea.selectionStart;
		}

		var front = ( txtarea.value ).substring( 0, strPos );
		var back = ( txtarea.value ).substring( strPos, txtarea.value.length );
		txtarea.value = front + text + back;
		strPos = strPos + text.length;
		if ( br === 'ie' ) {
			txtarea.focus();
			var ieRange = document.selection.createRange();
			ieRange.moveStart( 'character', -txtarea.value.length );
			ieRange.moveStart( 'character', strPos );
			ieRange.moveEnd( 'character', 0 );
			ieRange.select();
		}
		else if ( br === 'ff' ) {
			txtarea.selectionStart = strPos;
			txtarea.selectionEnd = strPos;
			txtarea.focus();
		}

		txtarea.scrollTop = scrollPos;

		this.contentBlock.content_markdown = txtarea.value;
	}
}
