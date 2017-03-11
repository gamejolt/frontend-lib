import { NgModule } from 'ng-metadata/core';
import { PartnerReferral } from './partner-referral-service';

@NgModule({
	providers: [
		{ provide: 'PartnerReferral', useFactory: () => PartnerReferral },
	],
})
export class PartnerReferralModule { }
