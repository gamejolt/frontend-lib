import { NgModule } from 'ng-metadata/core';
import { Translate } from './translate.service';

@NgModule({
	imports: ['gettext'],
	providers: [{ provide: 'Translate', useFactory: () => Translate }],
})
export class TranslateModule {}
