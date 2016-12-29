import { provide } from '@angular/core';
import { PaginationComponent } from './pagination.component';

export default angular.module( 'gj.Pagination', [] )
.directive( ...provide( PaginationComponent ) )
.name;
