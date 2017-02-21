import { Component, Input, Output, Inject, EventEmitter } from 'ng-metadata/core';
import { Popover } from '../../popover/popover.service';
import { SiteTemplate } from '../../site/template/template-model';
import * as template from '!html-loader!./selector.component.html';

@Component({
	selector: 'gj-theme-selector',
	template,
})
export class ThemeSelectorComponent
{
	@Input() templates: SiteTemplate[];
	@Input() currentTemplate: number;

	@Output() private changed = new EventEmitter<number>();

	current: any;

	constructor(
		@Inject( 'Popover' ) private popover: Popover,
	)
	{
	}

	ngOnInit()
	{
		if ( this.currentTemplate ) {
			this.current = _.find( this.templates, { id: this.currentTemplate } );
		}
	}

	select( id: number )
	{
		this.currentTemplate = id;
		this.current = _.find( this.templates, { id: this.currentTemplate } );
		this.changed.emit( id );
		this.popover.hideAll();
	}
}
