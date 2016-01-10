angular.module( 'gj.Jam' ).factory( 'Jam', function( Model, Environment, Api )
{
	function Jam( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.id ) {
				this.manageUrl = Environment.jamsBaseUrl + '/manage/jams/' + data.id + '/view';
			}

			if ( data.url ) {
				this.fullUrl =  Environment.jamsIoBaseUrl + '/' + data.url;
			}
		}
	}

	Jam.STATUS_HIDDEN = 'hidden';
	Jam.STATUS_ACTIVE = 'active';
	Jam.STATUS_UNLISTED = 'unlisted';
	Jam.STATUS_REMOVED = 'removed';

	Jam.PERIOD_PREJAM = 1;
	Jam.PERIOD_RUNNING = 2;
	Jam.PERIOD_VOTING = 3;
	Jam.PERIOD_POSTJAM = 4;

	Jam.TIMELINE_PRE = 10;
	Jam.TIMELINE_RUNNING = 20;
	Jam.TIMELINE_VOTING = 21;
	Jam.TIMELINE_POST = 30;
	Jam.TIMELINE_PROCESSING_VOTES = 32;
	Jam.TIMELINE_VOTED = 33;

	Jam.prototype.getUrl = function( page )
	{
		if ( angular.isUndefined( page ) ) {
			return '/' + this.url;
		}
		else if ( page == 'games' ) {
			return this.getUrl() + '/games';
		}
		else if ( page == 'manage-edit' ) {
			return '/manage/jams/' + this.id + '/edit';
		}
		else if ( page == 'manage-voting' ) {
			return '/manage/jams/' + this.id + '/voting';
		}
	};

	/**
	 * Get what period the jam is currently in at this exact moment.
	 * @return {boolean}
	 */
	Jam.prototype.getPeriod = function()
	{
		var now = moment();

		// Are we in a pre-jam state?
		var startMoment = moment( this.start_date );
		if ( now.isBefore( startMoment ) ) {
			return Jam.PERIOD_PREJAM;
		}

		// Is the jam currently running?
		var endMoment = moment( this.end_date );
		if ( now.isBefore( endMoment ) ) {
			return Jam.PERIOD_RUNNING;
		}

		// Are we in a voting period?
		if ( this.voting_enabled ) {
			var votingEndMoment = moment( this.voting_end_date );

			if ( now.isBefore( votingEndMoment ) ) {
				return Jam.PERIOD_VOTING;
			}
		}

		// If all previous checks failed, then our jam is over.
		return Jam.PERIOD_POSTJAM;
	};

	Jam.prototype.getTimelineState = function()
	{
		var period = this.getPeriod();

		if ( period == Jam.PERIOD_PREJAM ) {
			return Jam.TIMELINE_PRE;
		}
		else if ( period == Jam.PERIOD_RUNNING ) {
			return Jam.TIMELINE_RUNNING;
		}
		else if ( period == Jam.PERIOD_VOTING ) {
			return Jam.TIMELINE_VOTING;
		}
		else if ( !this.voting_enabled && period == Jam.PERIOD_POSTJAM ) {
			return Jam.TIMELINE_POST;
		}
		else if ( this.voting_enabled && period == Jam.PERIOD_POSTJAM ) {
			if ( !this.are_results_calculated ) {
				return Jam.TIMELINE_PROCESSING_VOTES;
			}
			else {
				return Jam.TIMELINE_VOTED;
			}
		}

		return undefined;
	};

	Jam.prototype.hasCommunityVoting = function()
	{
		return this.voting_enabled && this.has_community_voting;
	};

	Jam.prototype.hasAwards = function()
	{
		return this.voting_enabled && this.has_awards;
	};

	Jam.prototype.$save = function()
	{
		if ( !this.id ) {
			return this.$_save( '/jams/manage/jams/add', 'jam' );
		}
		else {
			return this.$_save( '/jams/manage/jams/save/' + this.id, 'jam' );
		}
	};

	Jam.prototype.$saveTwitter = function()
	{
		return this.$_save( '/jams/manage/jams/activity-feed/save-twitter/' + this.id, 'jam' );
	};

	Jam.prototype.$clearTwitter = function()
	{
		return this.$_save( '/jams/manage/jams/activity-feed/clear-twitter/' + this.id, 'jam' );
	};

	Jam.prototype.$setFeatureState = function( feature, state )
	{
		return this.$_save( '/jams/manage/jams/set-feature-state/' + this.id + '/' + feature + '/' + state, 'jam' );
	};

	Jam.prototype.$saveVoting = function()
	{
		return this.$_save( '/jams/manage/jams/voting/save/' + this.id, 'jam' );
	};

	Jam.prototype.$setStatus = function( status )
	{
		return this.$_save( '/jams/manage/jams/set-status/' + this.id + '/' + status, 'jam' );
	};

	Jam.prototype.$saveTheme = function()
	{
		var _this = this;

		// We need to send in the theme instead of the jam to the save method, so we can't use $_save.
		return Api.sendRequest( '/jams/manage/jams/theme/save/' + this.id, (this.theme || {}), { sanitizeComplexData: false } ).then( function( response )
		{
			return _this.processUpdate( response, 'jam' );
		} );
	};

	Jam.prototype.$remove = function()
	{
		return this.$_remove( '/jams/manage/jams/remove/' + this.id );
	};

	return Model.create( Jam );
} );
