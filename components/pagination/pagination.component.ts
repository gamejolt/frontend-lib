import { Component, Input, Output, OnChanges, SimpleChanges, Inject } from '@angular/core';
import template from 'html!./pagination.component.html';
import { Screen } from '../screen/screen-service';

const MaxPagesShown = 5;

@Component({
	selector: 'gj-pagination',
	template,
})
export class PaginationComponent implements OnChanges
{
	@Input( '<' ) totalItems: number;
	@Input( '<' ) itemsPerPage: number;
	@Input( '<' ) currentPage: number;
	@Input( '@?' ) queryParam = 'page';

	// These only make sense for pagers.
	@Input( '<?' ) pager = false;
	@Input( '<?' ) reverseButtons = false;
	@Input( '@?' ) nextText?: string;
	@Input( '@?' ) previousText?: string;

	@Output( '?' ) onPageChange: Function;

	prevPage: number | undefined;
	nextPage: number;
	prevChunkPage: number | undefined;
	nextChunkPage: number | undefined;
	totalPages: number;
	hasPrevious: boolean;
	hasNext: boolean;

	pages: number[] = [];

	constructor(
		@Inject( '$state' ) public $state: ng.ui.IStateService,
		@Inject( 'Screen' ) public screen: Screen,
	)
	{
	}

	ngOnChanges( changes: SimpleChanges )
	{
		if ( changes['totalItems'] || changes['itemsPerPage'] || changes['currentPage'] ) {
			this.calculatePagination();
		}
	}

	getTotalPages()
	{
		const totalPages = Math.ceil( this.totalItems / this.itemsPerPage );
		return Math.max( totalPages || 0, 1 );
	}

	calculatePagination()
	{
		// Make sure integers.
		if ( typeof this.totalItems === 'string' ) {
			this.totalItems = parseInt( this.totalItems, 10 );
		}

		if ( typeof this.currentPage === 'string' ) {
			this.currentPage = parseInt( this.currentPage, 10 );
		}

		// Clear out the page param when it's the first page.
		this.prevPage = this.currentPage - 1 > 1 ? this.currentPage - 1 : undefined;
		this.nextPage = this.currentPage + 1;

		this.totalPages = this.getTotalPages();

		this.hasPrevious = this.currentPage > 1;
		this.hasNext = this.currentPage < this.totalPages;

		const startPage = ((Math.ceil( this.currentPage / MaxPagesShown ) - 1) * MaxPagesShown) + 1;

		// Adjust last page if limit is exceeded
		const endPage = Math.min( startPage + MaxPagesShown - 1, this.totalPages );

		this.pages = [];
		for ( let i = startPage; i <= endPage; ++i ) {
			this.pages.push( i );
		}

		// Chunks.
		this.prevChunkPage = undefined;
		if ( startPage > 1 ) {
			this.prevChunkPage = startPage - 1;
		}

		this.nextChunkPage = undefined;
		if ( endPage < this.totalPages ) {
			this.nextChunkPage = endPage + 1;
		}
	}

	onPageClick( $event: JQueryEventObject, page: number )
	{
		if ( this.onPageChange ) {
			this.onPageChange( { $event: $event, $page: page } );
		}
	}
}
