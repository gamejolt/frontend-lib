import { NgModule } from 'ng-metadata/core';
import { makeProvider } from '../../utils/angular-facade';
import { Device } from './device.service';

@NgModule({
	providers: [
		makeProvider( 'Device', Device ),
	],
})
export class DeviceModule { }
