import { NgModule } from 'ng-metadata/core';
import { Scroll } from './scroll.service';

@NgModule({
	providers: [{ provide: 'Scroll', useFactory: () => Scroll }],
})
export class ScrollModule {}
