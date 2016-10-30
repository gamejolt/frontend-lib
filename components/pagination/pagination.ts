import { provide } from 'ng-metadata/core';
import { PaginationComponent } from './pagination.component';

export default angular.module( 'gj.Pagination', [] )
.directive( ...provide( PaginationComponent ) )
.name;
