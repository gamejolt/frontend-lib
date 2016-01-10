angular.module( 'gj.DateHelper' ).service( 'DateHelper', function( $window )
{
	/**
	 * Converts an input date to a moment object.
	 * Optionally takes in a timezone.
	 * 
	 * @param {Date|integer|string} date - Date object, or a timestamp in milliseconds, or a date string.
	 * @param {string} [timezone] - Timezone string.
	 * @return {Moment}
	 */
	this.toMoment = function( date, timezone )
	{
		var momentDate = $window.moment( date );

		// If a timezone is passed in, then we should modify the time to be relative to this new
		// offset. So it'll push our local time back to midnight.
		if ( timezone ) {
			momentDate.tz( timezone );
		}

		return momentDate;
	}

	/**
	 * Converts a moment object to a date.
	 * We are explicit about the exact year, month, etc.
	 * This allows you to set up a moment object in a different timezone and then copy those exact
	 * values over to a date object, without it doing conversion of values into local time.
	 * 
	 * @param {Moment} momentObj
	 * @return {Date}
	 */
	this.toDate = function( momentObj )
	{
		return new Date( momentObj.year(), momentObj.month(), momentObj.date(), momentObj.hour(), momentObj.minute(), momentObj.millisecond() );
	};

	/**
	 * Basically takes a date and assumes a new timezone with the exact date values.
	 *
	 * 
	 * @param {Date} date
	 * @param {string} [timezone] - If no timezone, will just parse in local time.
	 * @return {Moment}
	 */
	this.changeTimezone = function( date, timezone )
	{
		// Make date parameters.
		// No timezone passed in here, so it'll be sent in as a timezoneless date.
		// When that's the case, moment-timezone parses the date in the timezone that's passed in.
		var dateParams = {
			year: date.getFullYear(),
			month: date.getMonth(),
			day: date.getDate(),
			hour: date.getHours(),
			minute: date.getMinutes()
		};

		// If a timezone is passed in, we parse these date params within that timezone.
		// Otherwise they will be set to the local computer's timezone.
		if ( timezone ) {
			return $window.moment.tz( dateParams, timezone ).toDate();
		}
		else {
			return $window.moment( dateParams ).toDate();
		}
	};
} );