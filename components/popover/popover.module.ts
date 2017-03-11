import { NgModule } from 'ng-metadata/core';
import { PopoverTriggerDirective } from './popover-trigger.directive';
import { Popover } from './popover.service';
import { AppPopover } from './popover';
import { makeComponentProvider } from '../../vue/angular-link';

@NgModule({
	declarations: [
		PopoverTriggerDirective,
		makeComponentProvider( AppPopover, [ 'focused', 'blurred' ] ),
	],
	providers: [
		{ provide: 'Popover', useFactory: () => Popover },
	]
})
export class PopoverModule { }
