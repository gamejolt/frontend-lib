import { provide } from 'ng-metadata/core';
import { ThemeInjectorComponent } from './injector.component';

export default angular.module( 'gj.Theme.Injector', [] )
.directive( ...provide( ThemeInjectorComponent ) )
.name;
