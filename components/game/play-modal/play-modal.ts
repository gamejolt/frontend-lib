import { provide } from '@angular/core';
import { PlayModalComponent } from './play-modal-directive';
import { EmbedComponent } from './embed-directive';
import { Game_PlayModal } from './play-modal-service';

export default angular.module( 'gj.Game.PlayModal', [
	'gj.Growls',
	'gj.Ad.Video',
	'gj.HistoryTick',
	'gj.Analytics',
	'gj.Load',
] )
.directive( ...provide( PlayModalComponent ) )
.directive( ...provide( EmbedComponent ) )
.service( ...provide( 'Game_PlayModal', { useClass: Game_PlayModal } ) )
.name;
