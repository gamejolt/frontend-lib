import { NgModule } from 'ng-metadata/core';
import { SiteBuild } from './build-model';

@NgModule({
	providers: [{ provide: 'SiteBuild', useFactory: () => SiteBuild }],
})
export class SiteBuildModule {}
