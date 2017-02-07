import { NgModule } from 'ng-metadata/core';
import { FiresidePostLike } from './like-model';

@NgModule({
	providers: [
		{ provide: 'Fireside_Post_Like', useFactory: () => FiresidePostLike },
	],
})
export class FiresidePostLikeModule { }
