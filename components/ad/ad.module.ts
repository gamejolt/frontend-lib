import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../vue/angular-link';
import { Ads } from './ads.service';
import { AppAd } from './ad';

@NgModule({
	providers: [
		{ provide: 'Ads', useFactory: () => Ads },
	],
	declarations: [
		makeComponentProvider( AppAd ),
	]
})
export class AdModule { }
