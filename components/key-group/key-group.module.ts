import { NgModule } from 'ng-metadata/core';
import { KeyGroup } from './key-group.model';

@NgModule({
	providers: [{ provide: 'KeyGroup', useFactory: () => KeyGroup }],
})
export class KeyGroupModule {}
