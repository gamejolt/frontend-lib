import { NgModule } from 'ng-metadata/core';
import { ReportModal } from './modal.service';

@NgModule({
	providers: [
		{ provide: 'Report_Modal', useFactory: () => ReportModal },
	],
})
export class ReportModalModule { }
