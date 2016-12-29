import { provide } from '@angular/core';
import { TranslateSpoof } from './spoof.service';

export default angular.module( 'gj.Translate.Spoof', [] )
.service( ...provide( 'gettextCatalog', { useClass: TranslateSpoof } ) )
.name
;
