import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../vue/angular-link';
import { AppFadeCollapse } from './fade-collapse';

@NgModule({
	declarations: [
		makeComponentProvider( AppFadeCollapse, [ 'required' ] ),
	],
})
export class FadeCollapseModule { }
