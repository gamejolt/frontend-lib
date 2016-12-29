import { provide } from '@angular/core';
import { PartnerReferral } from './partner-referral-service';

export default angular.module( 'gj.PartnerReferral', [] )
.service( ...provide( 'PartnerReferral', { useClass: PartnerReferral } ) )
.name;
