angular.module( 'gj.Pagination' ).directive( 'gjPager', function()
{
	return {
		restrict: 'E',
		scope: {
			totalItems: '=',
			itemsPerPage: '=',
			currentPage: '=',
			onPageChange: '&?',
			queryParam: '@?',

			reverseButtons: '=?',
			nextText: '@?',
			previousText: '@?',
		},
		templateUrl: '/lib/gj-lib-client/components/pagination/pager.html',
		controller: 'PaginationCtrl',
		controllerAs: 'ctrl',
		bindToController: true
	};
} );
