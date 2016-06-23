import { ModelFactory } from './model-service';
<<<<<<< HEAD

export const ModelModule = angular.module( 'gj.Model', [] )
=======
export { Model } from './model-service';

export default angular.module( 'gj.Model', [] )
>>>>>>> master
.factory( 'Model', ModelFactory )
.name
;
