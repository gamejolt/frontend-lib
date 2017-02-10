import * as angular from 'angular';
import { NgModule } from 'ng-metadata/core';
import { makeProvider } from '../../utils/angular-facade';
import { Screen } from './screen-service';

angular.module( 'gj.Screen', [] );

import './screen-classes-directive';
import './screen-context-directive';

@NgModule({
	imports: [
		'gj.Screen',
	],
	providers: [
		makeProvider( 'Screen', Screen ),
	],
})
export class ScreenModule { }
