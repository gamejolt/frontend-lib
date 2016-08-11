angular.module( 'gj.Form' ).component( 'gjFormLoader', {
	bindings: {
		url: '@',
		onLoaded: '&',
	},
	templateUrl: '',
	controller: function( Api )
	{
		var _this = this;

		Api.sendRequest( _this.url, null, { detach: true } )
			.then( function( payload )
			{
				_this.isLoaded = true;
				_this.onLoaded( { $payload: payload } );
			} );
	}
} );
