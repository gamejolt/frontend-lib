import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../vue/angular-link';
import { AppScrollAffix } from './affix';

@NgModule({
	declarations: [
		makeComponentProvider( AppScrollAffix ),
	],
})
export class ScrollAffixModule { }
