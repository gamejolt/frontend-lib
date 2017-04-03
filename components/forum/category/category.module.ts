import { NgModule } from 'ng-metadata/core';
import { ForumCategory } from './category.model';

@NgModule({
	providers: [
		{ provide: 'Forum_Category', useFactory: () => ForumCategory },
	],
})
export class ForumCategoryModule { }
