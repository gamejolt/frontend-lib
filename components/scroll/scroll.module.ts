import { NgModule } from 'ng-metadata/core';
import { Scroll } from './scroll.service';

// For the below required directives.
angular.module( 'gj.Scroll', [] );

require( './scroll-context-directive' );
require( './scroll-when-directive' );

@NgModule({
	imports: [
		'gj.Scroll',
	],
	providers: [
		{ provide: 'Scroll', useFactory: () => Scroll },
	],
})
export class ScrollModule { }
