import { provide } from 'ng-metadata/core';
import { PopoverTriggerComponent } from './popover-trigger.directive';
import { PopoverBackdropComponent } from './backdrop.component';
import { PopoverComponent } from './popover.component';
import { Popover } from './popover.service';

export default angular.module( 'gj.Popover', [] )
.directive( ...provide( PopoverTriggerComponent ) )
.directive( ...provide( PopoverBackdropComponent ) )
.directive( ...provide( PopoverComponent ) )
.service( ...provide( 'Popover', { useClass: Popover } ) )
.name;
