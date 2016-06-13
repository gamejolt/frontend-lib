import { ModelFactory } from './model-service';
export { Model } from './model-service';

export const ModelModule = angular.module( 'gj.Model', [] )
.factory( 'Model', ModelFactory )
.name
;
