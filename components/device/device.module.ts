import { NgModule } from 'ng-metadata/core';
import { Device } from './device.service';

@NgModule({
	providers: [
		{ provide: 'Device', useFactory: () => Device },
	],
})
export class DeviceModule { }
