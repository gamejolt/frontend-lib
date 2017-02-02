import { NgModule } from 'ng-metadata/core';
import { FiresidePostTag } from './tag-model';

@NgModule({
	providers: [
		{ provide: 'Fireside_Post_Tag', useFactory: () => FiresidePostTag },
	],
})
export class FiresidePostTagModule { }
