angular.module( 'gj.Game.PlayModal' ).directive( 'gjGamePlayModalEmbed', function()
{
	return {
		templateUrl: '/lib/gj-lib-client/components/game/play-modal/embed.html',
		scope: {
			build: '=gjBuild',
		},
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function( $element, $sce, $q, Environment, Game_PlayModal, Api, App )
		{
			var _this = this;

			this.token = undefined;
			this.src = undefined;

			this.embedWidth = this.build.embed_width;
			this.embedHeight = this.build.embed_height;

			$element.css( {
				width: this.embedWidth + 'px',
				height: this.embedHeight + 'px',
			} );

			$q.when()
				.then( function()
				{
					if ( App.user ) {
						return Api.sendRequest( '/web/dash/token' );
					}
				} )
				.then( function( response )
				{
					var src = Environment.gameserverUrl + '/view/' + _this.build.id;
					var queryParams = [];

					if ( response && response.token ) {
						queryParams.push( 'username=' + App.user.username );
						queryParams.push( 'token=' + response.token );
					}

					src += '?' + queryParams.join( '&' );
					_this.src = $sce.trustAsResourceUrl( src );
				} );
		},
		compile: function( element )
		{
			element.addClass( 'game-play-modal-embed' );
		}
	};
} );
