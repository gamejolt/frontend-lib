import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../vue/angular-link';
import { AppNavTabList } from './tab-list';

@NgModule({
	declarations: [makeComponentProvider(AppNavTabList)],
})
export class NavTabListModule {}
