import {
	Component,
	Input,
	Output,
	Inject,
	EventEmitter,
} from 'ng-metadata/core';
import { Popover } from '../../popover/popover.service';
import { SiteTemplate } from '../../site/template/template-model';
import * as template from '!html-loader!./selector.component.html';

@Component({
	selector: 'gj-theme-selector',
	template,
})
export class ThemeSelectorComponent {
	@Input() templates: SiteTemplate[];
	@Input() currentTemplate: number;

	@Output() private changed = new EventEmitter<number>();

	current: any;

	constructor() {}

	ngOnInit() {
		if (this.currentTemplate) {
			this.current = this.templates.find(t => t.id === this.currentTemplate);
		}
	}

	select(id: number) {
		this.currentTemplate = id;
		this.current = this.templates.find(t => t.id === this.currentTemplate);
		this.changed.emit(id);
		Popover.hideAll();
	}
}
