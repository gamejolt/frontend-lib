import { NgModule } from 'ng-metadata/core';
import { Connection } from './connection-service';

@NgModule({
	providers: [{ provide: 'Connection', useFactory: () => Connection }],
})
export class ConnectionModule {}
