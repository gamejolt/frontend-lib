import { NgModule } from 'ng-metadata/core';
import { makeProvider } from '../../utils/angular-facade';
import { Ads } from './ads.service';
import { AdComponent } from './ad.component';

angular.module( 'gj.Ad', [] );

require( './ad-directive' );

@NgModule({
	providers: [
		makeProvider( 'Ads', Ads ),
	],
	declarations: [
		AdComponent,
	]
})
export class AdModule { }
