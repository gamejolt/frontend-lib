angular.module( 'gj.Img.Crop' ).directive( 'gjImgCrop', function()
{
	return {
		restrict: 'A',
		require: 'ngModel',
		scope: {},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $element, $attrs, $rootScope, $parse, $q, $window, Screen )
		{
			var _this = this;
			var initialized = false;

			this.jcrop = undefined;

			var minSize;
			if ( $attrs.imgCropMinWidth || $attrs.imgCropMinHeight ) {
				minSize = [
					($attrs.imgCropMinWidth ? $parse( $attrs.imgCropMinWidth )( $scope.$parent ) : 0),
					($attrs.imgCropMinHeight ? $parse( $attrs.imgCropMinHeight )( $scope.$parent ) : 0),
				];
			}

			this.init = function()
			{
				$element.on( 'load', function()
				{
					// Set up the $render function.
					_this.ngModel.$render = render;

					// Make sure we clean up when destroyed.
					$scope.$on( '$destroy', function()
					{
						destroyJcrop();
					} );

					// This will set up jcrop if needed.
					render();
				} );
			};

			function render()
			{
				if ( !_this.jcrop ) {
					setupJcrop();
				}
			}

			function disable()
			{
				setupJcrop().then( function( jcrop )
				{
					jcrop.disable();
				} );
			}

			function enable()
			{
				setupJcrop().then( function( jcrop )
				{
					jcrop.enable();
				} );
			}

			var setupPromise;
			function setupJcrop()
			{
				if ( setupPromise ) {
					return setupPromise;
				}

				setupPromise = new Promise( function( resolve )
				{
					var jqueryElement = $window.jQuery( $element[0] );

					jqueryElement.Jcrop( {

						// We push the coordinates back onSelect.
						onSelect: function onSelect( coords )
						{
							_this.ngModel.$setViewValue( angular.copy( coords ) );
						},

						// The aspect ratio to honor, if any.
						aspectRatio: $attrs.imgCropAspectRatio ? $parse( $attrs.imgCropAspectRatio )( $scope.$parent ) : undefined,

						// The min width/height pulled above.
						minSize: minSize,

						// By default set the boxWidth to be the full width of this element's container.
						boxWidth: $element[0].parentNode.offsetWidth,
					},
					function()
					{
						_this.jcrop = this;

						var cropCoords = _this.ngModel.$isEmpty( _this.ngModel.$viewValue ) ? null : _this.ngModel.$viewValue;
						if ( !cropCoords ) {
							var bounds = this.getBounds();
							this.setSelect( [
								0,
								0,
								bounds[0],
								bounds[1],
							] );
						}
						else {
							this.setSelect( [
								cropCoords.x,
								cropCoords.y,
								cropCoords.x2,
								cropCoords.y2,
							] );
						}

						resolve( _this.jcrop );
					} );
				} );

				return setupPromise;
			}

			function destroyJcrop()
			{
				if ( _this.jcrop ) {
					_this.jcrop.destroy();
					_this.jcrop = undefined;
					setupPromise = undefined;
				}
			}

			Screen.setResizeSpy( $scope, function()
			{
				// If jcrop was set up, then we need to destroy and recreate it.
				// This will pull in the new sizing for jcrop.
				if ( _this.jcrop ) {
					destroyJcrop();
					render();
				}
			} );

			var observedSrc;
			$attrs.$observe( 'ngSrc', function( newSrc )
			{
				// The image src has changed.
				if ( !angular.isUndefined( observedSrc ) && observedSrc != newSrc ) {

					// If jcrop was set up, then we need to destroy and recreate it.
					if ( _this.jcrop ) {
						destroyJcrop();
						render();
					}
				}

				observedSrc = newSrc;
			} );

			var disabled;
			$attrs.$observe( 'disabled', function( newDisabled )
			{
				if ( typeof newDisabled !== 'undefined' && newDisabled !== disabled ) {
					disabled = newDisabled;

					if ( disabled ) {
						disable();
					}
					else {
						enable();
					}
				}
			} );
		},
		link: function( scope, element, attrs, ngModel )
		{
			scope.ctrl.ngModel = ngModel;
			scope.ctrl.init();
		}
	};
} );
