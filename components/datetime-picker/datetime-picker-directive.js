angular.module( 'gj.DatetimePicker' ).directive( 'gjDatetimePicker', function( $window, DateHelper )
{
	return {
		restrict: 'AE',
		require: '^form',
		templateUrl: '/lib/gj-lib-client/components/datetime-picker/datetime-picker.html',
		scope: {
			name: '@',
			dateModel: '=',
			timezone: '=?',
			minDate: '=',
			maxDate: '=',
			serverErrors: '=dateServerErrors'
		},
		link: function( scope, element, attrs, form )
		{
			// Model will be a timestamp (in milliseconds).
			if ( scope.dateModel ) {

				// Make a moment out of the timestamp.
				// Parse it into the timezone they set.
				scope.date = DateHelper.toMoment( scope.dateModel, scope.timezone );

				// Time is the same as date when it's passed in.
				scope.time = angular.copy( scope.date );
			}
			else {

				// If no timestamp passed in, then set date to null.
				// This way they can select a date from scratch.
				// Time should be set to midnight, though.
				scope.date = null;
				scope.time = $window.moment().startOf( 'day' );
			}

			// Now convert from moments to date objects.
			if ( scope.date ) {
				scope.date = DateHelper.toDate( scope.date );
			}

			if ( scope.time ) {
				scope.time = DateHelper.toDate( scope.time );
			}

			function updateModel()
			{
				if ( scope.date && scope.time ) {

					var localDate = angular.copy( scope.date );
					localDate.setHours( scope.time.getHours() );
					localDate.setMinutes( scope.time.getMinutes() );

					// Parse the date they selected in the timezone they selected and pull the milliseconds since epoch.
					scope.dateModel = DateHelper.changeTimezone( localDate, scope.timezone ).valueOf();
				}
			}

			scope.$watch( 'date', updateModel );
			scope.$watch( 'time', updateModel );
			scope.$watch( 'timezone', updateModel );
		}
	};
} );

/**
 * This allows us to interpolate the name field on the datepicker.
 * It's a hack to get interpolation working for name fields on forms to play nicely with errors.
 * http://plnkr.co/edit/VnHHEe?p=preview
 */
angular.module( 'gj.DatetimePicker' ).directive( 'gjDatetimePickerInterpolateName', function( $interpolate )
{
	return {
		priority: 10000,
		controller: function( $scope, $element, $attrs )
		{
			$attrs.$set( 'name', $interpolate( $attrs.gjDatetimePickerInterpolateName || $attrs.name )( $scope ) );
		}
	}
} )