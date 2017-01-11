import { provide } from 'ng-metadata/core';
import { TranslateSpoof } from './spoof.service';

export default angular.module( 'gj.Translate.Spoof', [] )
.service( ...provide( 'gettextCatalog', { useClass: TranslateSpoof } ) )
.name
;
