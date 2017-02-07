import { NgModule } from 'ng-metadata/core';
import { FiresidePostVideo } from './video-model';

@NgModule({
	providers: [
		{ provide: 'Fireside_Post_Video', useFactory: () => FiresidePostVideo },
	],
})
export class FiresidePostVideoModule { }
