import { NgModule } from 'ng-metadata/core';
import { LinkedKey } from './linked-key.model';

@NgModule({
	providers: [{ provide: 'LinkedKey', useFactory: () => LinkedKey }],
})
export class LinkedKeyModule {}
