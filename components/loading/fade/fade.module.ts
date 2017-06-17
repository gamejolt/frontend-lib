import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../vue/angular-link';
import { AppLoadingFade } from './fade';

@NgModule({
	declarations: [makeComponentProvider(AppLoadingFade)],
})
export class LoadingFadeModule {}
