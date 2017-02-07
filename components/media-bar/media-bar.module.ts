import { NgModule } from 'ng-metadata/core';
import { MediaBarComponent } from './media-bar.component';
import { MediaBarItemComponent } from './item/item.component';
import { MediaBarLightboxComponent } from './lightbox/lightbox.component';
import { MediaBarLightboxSliderComponent } from './lightbox/slider.component';
import { MediaBarLightboxItemComponent } from './lightbox/item/item.component';

@NgModule({
	declarations: [
		MediaBarComponent,
		MediaBarItemComponent,
		MediaBarLightboxComponent,
		MediaBarLightboxSliderComponent,
		MediaBarLightboxItemComponent,
	],
})
export class MediaBarModule { }
