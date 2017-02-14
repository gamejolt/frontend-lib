import { NgModule } from 'ng-metadata/core';
import { makeProvider } from '../../utils/angular-facade';
import { PartnerReferral } from './partner-referral-service';

@NgModule({
	providers: [
		makeProvider( 'PartnerReferral', PartnerReferral ),
	],
})
export class PartnerReferralModule { }
