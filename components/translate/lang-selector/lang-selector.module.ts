import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../vue/angular-link';
import { AppTranslateLangSelector } from './lang-selector';

@NgModule({
	declarations: [makeComponentProvider(AppTranslateLangSelector)],
})
export class TranslateLangSelectorModule {}
