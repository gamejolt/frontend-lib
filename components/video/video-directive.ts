import { Component, Inject, Input, OnInit, OnDestroy } from 'ng-metadata/core';
import * as template from '!html-loader!./video.html';

/**
 * We have to not use angular for video embed stuff!
 * https://forum.ionicframework.com/t/ionic-2-video-video-memory-leak-garbage-collection-solved/52333
 * Massive memory leaks if we don't keep this out of angular and finely tuned.'
 */
@Component({
	selector: 'gj-video',
	template,
})
export class VideoComponent implements OnInit, OnDestroy
{
	@Input( '@' ) poster: any;
	@Input( '@' ) webm: any;
	@Input( '@' ) mp4: any;
	@Input( '<' ) showLoading = false;

	private video: HTMLVideoElement;

	// Start as undefined so the bind-once will resolve once true.
	isLoaded = false;

	constructor(
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
	)
	{
	}

	ngOnInit()
	{
		const webm = document.createElement( 'source' );
		webm.type = 'video/webm';
		webm.src = this.webm;

		const mp4 = document.createElement( 'source' );
		mp4.type = 'video/mp4';
		mp4.src = this.mp4;

		this.video = document.createElement( 'video' );
		this.video.poster = this.poster;
		this.video.loop = true;

		this.video.appendChild( webm );
		this.video.appendChild( mp4 );

		// This event continues to spawn.
		// Gotta remove once it fires the first time.
		let canplaythrough = () =>
		{
			this.$scope.$applyAsync( () =>
			{
				this.isLoaded = true;
				this.video.play();
				this.video.removeEventListener( 'canplaythrough', canplaythrough );
			} );
		};

		this.video.addEventListener( 'canplaythrough', canplaythrough );

		this.$element[0].appendChild( this.video );
	}

	/**
	 * This is ridiculous, but it's needed. Memory leaks if we don't!
	 * https://dev.w3.org/html5/spec-author-view/video.html#best-practices-for-authors-using-media-elements
	 */
	ngOnDestroy()
	{
		// Empty all sources.
		while ( this.video.firstChild ) {
			this.video.removeChild( this.video.firstChild );
		}

		this.video.load();
	}
}
