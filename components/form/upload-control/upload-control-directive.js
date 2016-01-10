angular.module( 'gj.Form.UploadControl' ).directive( 'gjFormUploadControl', function( $q, $document, $window, $parse, Api, Screen )
{
	return {
		restrict: 'E',
		require: [ 'ngModel', '^^formGroup' ],
		scope: {
			gjFileSelect: '&?gjFileSelect',
		},
		templateUrl: '/lib/gj-lib-client/components/form/upload-control/upload-control.html',
		link: function( scope, element, attrs, ctrls )
		{
			var ngModel = ctrls[0];
			var formGroup = ctrls[1];

			var dimensionsResolver = null;

			scope.Screen = Screen;
			scope.ngModel = ngModel;
			scope.progress = false;

			ngModel.$isEmpty = $isEmpty;
			scope.onFileSelect = onFileSelect;
			scope.clearFiles = clearFiles;

			setupAcceptValidator();
			setupFilesizeValidator();
			setupGeometryValidators();

			// Make sure this control/model is completely reset on control load.
			// This makes sure to remove any files that may have been set on the model on a save,
			// but now we want to clear it all out completely for an edit form.
			scope.clearFiles();

			// When an upload handler is set on the form state, we want to attach
			// to it so we can show the progress of the upload.
			// The form service should set this up on the `formState` object as a `progress` Promise.
			scope.$watch( function()
			{
				if ( scope.$parent.formState ) {
					return scope.$parent.formState.progress;
				}
				return undefined;
			}, attachUploadHandler );

			// When a file is selected, let's see if we should forward it to any gjFileSelect handler attached.
			ngModel.$viewChangeListeners.push( function()
			{
				if ( scope.gjFileSelect && ngModel.$valid && !ngModel.$isEmpty( ngModel.$viewValue ) ) {
					scope.gjFileSelect( {} );
				}
			} );

			function $isEmpty( value )
			{
				return angular.isUndefined( value )
					|| value === ''
					|| value === null
					|| value !== value
					|| (angular.isArray( value ) && value.length == 0)
					;
			}

			function attachUploadHandler( uploadHandler )
			{
				if ( uploadHandler ) {

					// Watch the progress event and update our progress.
					uploadHandler.then( null, null, function( event )
					{
						if ( event.lengthComputable ) {
							scope.progress = Math.ceil( 100.0 * event.loaded / event.total );
						}
					} )
					// When we've either completed or failed, return the progress to 0.
					.finally( function()
					{
						scope.progress = false;
					} );
				}
			}

			function onFileSelect( files )
			{
				// Any time they select new files and have geometry related validators, we want to set a new dimensions resolver.
				// This will get the new dimensions for the files passed in so that we can validate against them.
				if ( !ngModel.$isEmpty( files ) ) {
					var promises = files.map( function( file )
					{
						return getImgDimensions( file );
					} );

					dimensionsResolver = $q.all( promises );
				}
				// If no files, then just clear the resolver.
				else {
					dimensionsResolver = null;
				}

				ngModel.$setViewValue( files );
			}

			function clearFiles()
			{
				// If no files, then just clear the resolver.
				dimensionsResolver = null;
				ngModel.$setViewValue( undefined );
			}

			function setupAcceptValidator()
			{
				if ( angular.isDefined( attrs.accept ) ) {

					var accept;
					attrs.$observe( 'accept', function( val )
					{
						accept = val;
						ngModel.$validate();
						scope.accept = accept;
					} );

					ngModel.$validators.filetype = function( files )
					{
						if ( !accept ) {
							return true;
						}

						var valid = true;
						var acceptTypes = accept.split( ',' );
						angular.forEach( files, function( file )
						{
							var pieces = file.name.toLowerCase().split( '.' );

							if ( pieces.length < 2 ) {
								valid = false;
								return;
							}

							var ext = '.' + pieces.pop();
							if ( ext && acceptTypes.indexOf( ext ) == -1 ) {
								valid = false;
							}
						} );

						return valid;
					};
				}
			}

			function setupFilesizeValidator()
			{
				if ( attrs.gjMaxFilesize ) {

					var maxFilesize = $parse( attrs.gjMaxFilesize )( scope.$parent );
					if ( maxFilesize ) {
						maxFilesize = parseInt( maxFilesize, 10 );
						formGroup.setValidationData( 'filesize', maxFilesize );
					}

					ngModel.$validators.filesize = function( files )
					{
						// Check max filesize.
						if ( !maxFilesize ) {
							return true;
						}

						var valid = true;
						angular.forEach( files, function( file )
						{
							if ( file.size && file.size > maxFilesize ) {
								valid = false;
							}
						} );

						return valid;
					};
				}
			}

			function setupGeometryValidators()
			{
				var mapping = {
					'width': 'gjImgWidth',
					'min-width': 'gjMinImgWidth',
					'max-width': 'gjMaxImgWidth',
					'height': 'gjImgHeight',
					'min-height': 'gjMinImgHeight',
					'max-height': 'gjMaxImgHeight',
					'ratio': 'gjImgRatio',
					'min-ratio': 'gjMinImgRatio',
					'max-ratio': 'gjMaxImgRatio',
				};

				var geometryVals = {};
				var geometryToCheck = [];

				// Set up watches on all the attributes.
				angular.forEach( mapping, function( attr, check )
				{
					// Only set up the watch if the attribute is set.
					if ( attrs[ attr ] ) {
						geometryToCheck.push( check );

						// Only parse once!
						var parsed = $parse( attrs[ attr ] );
						scope.$watch( function()
						{
							// We need to watch the parsed value on the parent scope since this is an isolate scope directive.
							return parsed( scope.$parent );
						},
						function( val )
						{
							// Store so we can validate against this value in the validators.
							geometryVals[ check ] = val;

							// Validation data needs to be set on the form group so it can give better error messages.
							formGroup.setValidationData( check, val );
						} );
					}
				} );

				// If we have any geometry validations to do, then we need to set up the actual validators.
				// We skip this if no geometry-related validators were set on the element.
				if ( geometryToCheck.length ) {

					// Make the values the keys so it's easier to check if validators are set.
					var geometryKeys = {};
					geometryToCheck.forEach( function( check )
					{
						geometryKeys[ check ] = true;
					} );

					if ( geometryKeys['width'] || geometryKeys['height'] ) {
						ngModel.$asyncValidators.dimensions = setupGeometryValidator( function( dimensions )
						{
							if ( geometryVals['width'] && geometryVals['height'] ) {
								return dimensions[0] == geometryVals['width'] && dimensions[1] == geometryVals['height'];
							}
							else if ( geometryVals['width'] ) {
								return dimensions[0] == geometryVals['width'];
							}
							else if ( geometryVals['width'] ) {
								return dimensions[1] == geometryVals['height'];
							}
						} );
					}
					else {
						if ( geometryKeys['min-width'] || geometryKeys['min-height'] ) {
							ngModel.$asyncValidators.minDimensions = setupGeometryValidator( function( dimensions )
							{
								if ( geometryVals['min-width'] && geometryVals['min-height'] ) {
									return dimensions[0] >= geometryVals['min-width'] && dimensions[1] >= geometryVals['min-height'];
								}
								else if ( geometryVals['min-width'] ) {
									return dimensions[0] >= geometryVals['min-width'];
								}
								else if ( geometryVals['min-width'] ) {
									return dimensions[1] >= geometryVals['min-height'];
								}
							} );
						}

						if ( geometryKeys['max-width'] || geometryKeys['max-height'] ) {
							ngModel.$asyncValidators.maxDimensions = setupGeometryValidator( function( dimensions )
							{
								if ( geometryVals['max-width'] && geometryVals['max-height'] ) {
									return dimensions[0] <= geometryVals['max-width'] && dimensions[1] <= geometryVals['max-height'];
								}
								else if ( geometryVals['max-width'] ) {
									return dimensions[0] <= geometryVals['max-width'];
								}
								else if ( geometryVals['max-width'] ) {
									return dimensions[1] <= geometryVals['max-height'];
								}
							} );
						}
					}

					if ( geometryKeys['ratio'] ) {
						ngModel.$asyncValidators.ratio = setupGeometryValidator( function( dimensions )
						{
							var ratio = dimensions[0] / dimensions[1];
							if ( geometryVals['ratio'] ) {
								return ratio == geometryVals['ratio'];
							}
						} );
					}
					else if ( geometryKeys['min-ratio'] ) {
						ngModel.$asyncValidators.minRatio = setupGeometryValidator( function( dimensions )
						{
							var ratio = dimensions[0] / dimensions[1];
							if ( geometryVals['min-ratio'] ) {
								return ratio >= geometryVals['min-ratio'];
							}
						} );
					}
					else if ( geometryKeys['max-ratio'] ) {
						ngModel.$asyncValidators.maxRatio = setupGeometryValidator( function( dimensions )
						{
							var ratio = dimensions[0] / dimensions[1];
							if ( geometryVals['max-ratio'] ) {
								return ratio <= geometryVals['max-ratio'];
							}
						} );
					}
				}

				/**
				 * Convenience method that makes an async validation function for dimension-related validators.
				 * It basically just wraps the dimensions resolver so that it waits for the dimensions of the image
				 * before it does the specific validator check.
				 */
				function setupGeometryValidator( fn )
				{
					return function()
					{
						// Dimensions resolver won't be set if there is no file selected.
						// If there's no file selected we just want to resolve right away so the error message clears.
						// Otherwise we want to do the check after the dimensions are gathered.
						if ( dimensionsResolver ) {
							return dimensionsResolver.then( function( filesDimensions )
							{
								var resolution = true;
								filesDimensions.forEach( function( dimensions )
								{
									if ( !fn( dimensions ) ) {
										resolution = false;
									}
								} );

								if ( resolution ) {
									return true;
								}

								return $q.reject();
							} );
						}

						return $q.when( true );
					};
				}
			}

			function getImgDimensions( file )
			{
				return $q( function( resolve, reject )
				{
					var img = $document[0].createElement( 'img' );
					img.src = $window.URL.createObjectURL( file );
					img.onload = function()
					{
						resolve( [ this.width, this.height ] );
						$window.URL.revokeObjectURL( this.src );
					};
				} );
			}
		}
	};
} );
