import { provide } from '@angular/core';
import { MediaBarComponent } from './media-bar.component';
import { MediaBarItemComponent } from './item/item.component';
import { MediaBarLightboxComponent } from './lightbox/lightbox.component';
import { MediaBarLightboxItemComponent } from './lightbox/item/item.component';

export default angular.module( 'gj.MediaBar', [] )
.directive( ...provide( MediaBarComponent ) )
.directive( ...provide( MediaBarItemComponent ) )
.directive( ...provide( MediaBarLightboxComponent ) )
.directive( ...provide( MediaBarLightboxItemComponent ) )
.name;
