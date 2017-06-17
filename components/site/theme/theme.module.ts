import { NgModule } from 'ng-metadata/core';
import { SiteTheme } from './theme-model';

@NgModule({
	providers: [{ provide: 'SiteTheme', useFactory: () => SiteTheme }],
})
export class SiteThemeModule {}
