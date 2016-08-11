import { provide } from 'ng-metadata/core';
import { Clipboard } from './clipboard-service';

export default angular.module( 'gj.Clipboard', [] )
.service( ...provide( 'Clipboard', { useClass: Clipboard } ) )
.name;
