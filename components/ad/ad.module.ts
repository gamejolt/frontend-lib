import { NgModule } from 'ng-metadata/core';
import { Ads } from './ads.service';

angular.module( 'gj.Ad', [] );

require( './ad-directive' );

@NgModule({
	imports: [
		'gj.Ad',
	],
	providers: [
		{ provide: 'Ads', useFactory: () => Ads },
	],
})
export class AdModule { }
