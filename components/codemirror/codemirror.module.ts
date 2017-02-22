import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../vue/angular-link';
import { AppCodemirror } from './codemirror';

@NgModule({
	declarations: [
		makeComponentProvider( AppCodemirror, [ 'changed' ] )
	],
})
export class CodemirrorModule { }
