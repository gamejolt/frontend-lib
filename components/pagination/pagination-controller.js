angular.module( 'gj.Pagination' ).controller( 'PaginationCtrl', function( $scope, $state )
{
	var _this = this;

	$scope.$state = $state;

	this.queryParam = this.queryParam || 'page';

	this.getTotalPages = function()
	{
		var totalPages = Math.ceil( this.totalItems / this.itemsPerPage );
		return Math.max( totalPages || 0, 1 );
	};

	this.calculatePagination = function()
	{
		// Make sure integers.
		this.totalItems = parseInt( this.totalItems, 10 );
		this.currentPage = parseInt( this.currentPage, 10 );

		// Clear out the page param when it's the first page.
		this.prevPage = this.currentPage - 1 > 1 ? this.currentPage - 1 : undefined;
		this.nextPage = this.currentPage + 1;

		this.totalPages = this.getTotalPages();

		this.hasPrevious = this.currentPage > 1;
		this.hasNext = this.currentPage < this.totalPages;

		// Visible pages are paginated with maxSize
		var maxSize = 5;
		startPage = ((Math.ceil( this.currentPage / maxSize ) - 1) * maxSize) + 1;

		// Adjust last page if limit is exceeded
		endPage = Math.min( startPage + maxSize - 1, this.totalPages );

		this.pages = [];
		for ( var i = startPage; i <= endPage; ++i ) {
			this.pages.push( i );
		}

		// Chunks.
		this.prevChunkPage = null;
		if ( startPage > 1 ) {
			this.prevChunkPage = startPage - 1;
		}

		this.nextChunkPage = null;
		if ( endPage < this.totalPages ) {
			this.nextChunkPage = endPage + 1;
		}
	};

	this.onPageClick = function( $event, page )
	{
		// Simply forward...
		if ( this.onPageChange ) {
			this.onPageChange( { $event: $event, $page: page } );
		}
	};

	$scope.$watchGroup( [ 'ctrl.totalItems', 'ctrl.itemsPerPage', 'ctrl.currentPage' ], function()
	{
		_this.calculatePagination();
	} );
} );
