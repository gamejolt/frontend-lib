import { provide } from 'ng-metadata/core';
import { PlayModalComponent } from './play-modal.component';
import { GamePlayModal } from './play-modal.service';

export default angular.module( 'gj.Game.PlayModal', [
	'gj.Growls',
	'gj.HistoryTick',
	'gj.Load',
] )
.service( ...provide( 'Game_PlayModal', { useClass: GamePlayModal } ) )
.directive( ...provide( PlayModalComponent ) )
.name;
