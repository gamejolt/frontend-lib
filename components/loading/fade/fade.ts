import { provide } from 'ng-metadata/core';
import { LoadingFadeComponent } from './fade.component';

export default angular.module( 'gj.Loading.Fade', [] )
.directive( ...provide( LoadingFadeComponent ) )
.name;
