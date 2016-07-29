angular.module( 'gj.Form.UploadControl' ).component( 'gjFormUploadControlImgPreview', {
	template: '<canvas class="img-responsive">',
	bindings: {
		file: '<',
	},
	controller: function( $scope, $element, $window, $timeout, Ruler )
	{
		if ( !($window.FileReader && $window.CanvasRenderingContext2D) ) {
			return;
		}

		var canvas = $element[0].querySelector( 'canvas' );
		var reader = new FileReader();

		reader.onload = onLoadFile;
		reader.readAsDataURL( this.file );

		function onLoadFile( event )
		{
			var img = new Image();
			img.onload = onLoadImage;
			img.src = event.target.result;
		}

		function onLoadImage()
		{
			var img = this;
			$timeout( function()
			{
				var elementWidth = Ruler.outerWidth( canvas );
				var width = elementWidth;
				var height = img.height / img.width * elementWidth;
				canvas.width = width;
				canvas.height = height;
				canvas.getContext( '2d' ).drawImage( img, 0, 0, width, height );
			}, 0, false );
		}
	}
} );
