import { NgModule } from 'ng-metadata/core';
import { PopoverTriggerComponent } from './popover-trigger.directive';
import { PopoverBackdropComponent } from './backdrop.component';
import { PopoverComponent } from './popover.component';
import { Popover } from './popover.service';
import { PopoverContextDirective } from './popover-context.directive';

@NgModule({
	declarations: [
		PopoverContextDirective,
		PopoverTriggerComponent,
		PopoverBackdropComponent,
		PopoverComponent,
	],
	providers: [
		Popover,
	]
})
export class PopoverModule { }
