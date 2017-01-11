import { Component, Input, Output, Inject } from 'ng-metadata/core';
import { Popover } from '../../popover/popover.service';
import { SiteTemplate } from '../../site/template/template-model';
import template from 'html!./selector.component.html';

@Component({
	selector: 'gj-theme-selector',
	template,
})
export class ThemeSelectorComponent
{
	@Input( '<' ) templates: SiteTemplate[];
	@Input( '<' ) currentTemplate: number;

	@Output() changed: Function;

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
		this.changed( { $template: id } );
		this.popover.hideAll();
	}
}
