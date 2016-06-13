import { Fireside_PostFactory } from './post-model';

export const FiresidePostModule = angular.module( 'gj.Fireside.Post', [ 'gj.Model', 'gj.MediaItem' ] )
.factory( 'Fireside_Post', Fireside_PostFactory )
.name
;
