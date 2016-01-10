angular.module( 'gj.Jam.Page' ).factory( 'Jam_Page', function( Model, Api, Jam, Jam_ContentBlock )
{
	function Jam_Page( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.block ) {
				this.block = new Jam_ContentBlock( data.block );
			}
		}
	}

	Jam_Page.TYPE_HOME = 'home';
	Jam_Page.TYPE_PARTICIPANTS = 'participants';
	Jam_Page.TYPE_LIVESTREAMS = 'livestreams';
	Jam_Page.TYPE_GAMES = 'games';
	Jam_Page.TYPE_GAME_ENTRY = 'game-entry';
	Jam_Page.TYPE_CUSTOM = 'custom';

	Jam_Page.STATUS_INACTIVE = 0;
	Jam_Page.STATUS_ACTIVE = 1;
	Jam_Page.STATUS_DELETED = 2;

	Jam_Page.$saveSort = function( jamId, pagesSort )
	{
		return Api.sendRequest( '/jams/manage/jams/content/save-sorted-pages/' + jamId, pagesSort );
	};

	Jam_Page.prototype.getUrl = function( jam )
	{
		if ( jam ) {
			return jam.url + (this.url ? '/' + this.url : '');
		}

		return '';
	};

	Jam_Page.prototype.getFullUrl = function( jam )
	{
		if ( jam ) {
			return jam.fullUrl + (this.url ? '/' + this.url : '');
		}

		return '';
	};

	Jam_Page.prototype.getEditUrl = function( jam )
	{
		if ( jam ) {
			return this.getFullUrl( jam ) + '#edit-content:' + this.block.id;
		}

		return '';
	};

	Jam_Page.prototype.isActive = function()
	{
		return this.status == Jam_Page.STATUS_ACTIVE;
	};

	Jam_Page.prototype.isShownDuring = function( period )
	{
		if ( this.type == Jam_Page.TYPE_HOME ) {
			return true;
		}

		if ( this.type == Jam_Page.TYPE_GAMES ) {
			if ( period != Jam.PERIOD_PREJAM ) {
				return true;
			}
			return false;
		}

		if ( this.type == Jam_Page.TYPE_LIVESTREAMS ) {
			if ( period == Jam.PERIOD_RUNNING ) {
				return true;
			}
			return false;
		}

		return true;
	};

	Jam_Page.prototype.isShownDuringState = function( state )
	{
		if ( this.type == Jam_Page.TYPE_HOME ) {
			return true;
		}

		if ( this.type == Jam_Page.TYPE_GAMES ) {
			if ( state < Jam.TIMELINE_RUNNING ) {
				return true;
			}
			return false;
		}

		if ( this.type == Jam_Page.TYPE_LIVESTREAMS ) {
			if ( state == Jam.TIMELINE_RUNNING ) {
				return true;
			}
			return false;
		}

		return true;
	};

	Jam_Page.prototype.$save = function()
	{
		// Are we adding or saving?
		if ( !this.id ) {
			return this.$_save( '/jams/manage/jams/content/add-page/' + this.jam_id, 'jamPage' );
		}
		else {
			return this.$_save( '/jams/manage/jams/content/save-page/' + this.id, 'jamPage' );
		}
	};

	Jam_Page.prototype.$setStatus = function( status )
	{
		return this.$_save( '/jams/manage/jams/content/set-page-status/' + this.id + '/' + status, 'jamPage' );
	};

	Jam_Page.prototype.$remove = function()
	{
		return this.$_remove( '/jams/manage/jams/content/remove-page/' + this.id );
	};

	return Model.create( Jam_Page );
} );
