import { Fireside_Post_TagFactory } from './tag-model';
import { FiresidePostModule } from '../post';

export const FiresidePostTagModule = angular.module( 'gj.Fireside.Post.Tag', [ 'gj.Model', FiresidePostModule ] )
.factory( 'Fireside_Post_Tag', Fireside_Post_TagFactory )
.name
;
