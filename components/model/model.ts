import { ModelFactory } from './model-service';
export { Model } from './model-service';

export default angular.module( 'gj.Model', [] )
.factory( 'Model', ModelFactory )
.name
;
