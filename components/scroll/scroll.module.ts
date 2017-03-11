import { NgModule } from 'ng-metadata/core';
import { Scroll } from './scroll.service';

// For the below required directives.
angular.module( 'gj.Scroll', [] );

@NgModule({
	imports: [
		'duScroll',
		'gj.Scroll',
	],
	providers: [
		{ provide: 'Scroll', useFactory: () => Scroll },
	],
})
export class ScrollModule { }

require( './scroll-context-directive' );
require( './scroll-when-directive' );
