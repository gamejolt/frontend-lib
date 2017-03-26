import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../vue/angular-link';
import { AppPagination } from './pagination';

@NgModule({
	declarations: [
		makeComponentProvider( AppPagination ),
	],
})
export class PaginationModule { }
