import { provide } from 'ng-metadata/core';
import { ThemeSelectorComponent } from './selector.component';

export default angular.module( 'App.Theme.Selector', [] )
.directive( ...provide( ThemeSelectorComponent ) )
.name;
