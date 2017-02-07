import { NgModule } from 'ng-metadata/core';
import { makeProvider } from '../../utils/angular-facade';
import { Ads } from './ads.service';

angular.module( 'gj.Ad', [] );

require( './ad-directive' );

@NgModule({
	imports: [
		'gj.Ad',
	],
	providers: [
		makeProvider( 'Ads', Ads ),
	],
})
export class AdModule { }
