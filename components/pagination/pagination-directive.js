angular.module( 'gj.Pagination' ).directive( 'gjPagination', function()
{
	return {
		restrict: 'E',
		scope: {
			totalItems: '=',
			itemsPerPage: '=',
			currentPage: '=',
			onPageChange: '&?',
			queryParam: '@?',
		},
		templateUrl: '/lib/gj-lib-client/components/pagination/pagination.html',
		controller: 'PaginationCtrl',
		controllerAs: 'ctrl',
		bindToController: true
	};
} );
