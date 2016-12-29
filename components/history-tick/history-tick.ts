import { provide } from '@angular/core';
import { HistoryTick } from './history-tick-service';

export default angular.module( 'gj.HistoryTick', [ 'gj.Referrer' ] )
.service( ...provide( 'HistoryTick', { useClass: HistoryTick } ) )
.name;
