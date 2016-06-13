import { Fireside_Post_LikeFactory } from './like-model';
import { FiresidePostModule } from '../post';

export const FiresidePostLikeModule = angular.module( 'gj.Fireside.Post.Like', [ 'gj.Model', FiresidePostModule ] )
.factory( 'Fireside_Post_Like', Fireside_Post_LikeFactory )
.name
;
