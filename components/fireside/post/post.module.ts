import { NgModule } from 'ng-metadata/core';
import { FiresidePost } from './post-model';

@NgModule({
	providers: [
		{ provide: 'Fireside_Post', useFactory: () => FiresidePost },
	],
})
export class FiresidePostModule { }
