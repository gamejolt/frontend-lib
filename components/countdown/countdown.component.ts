import { Component, Inject, OnInit, OnDestroy, Input } from 'ng-metadata/core';

@Component({
	selector: 'gj-countdown',
	template: '',
})
export class CountdownComponent implements OnInit, OnDestroy
{
	@Input( '<' ) end: number;

	private intervalHandle: number;

	constructor(
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
	)
	{
	}

	ngOnInit()
	{
		this.updateTimer();
		this.intervalHandle = window.setInterval( () => this.updateTimer(), 1000 );
	}

	updateTimer()
	{
		let timeLeft = (this.end - Date.now()) / 1000;
		if ( timeLeft < 0 ) {
			this.$element[0].innerText = '0:0:0';
			return;
		}

		// Only show days left if there's more than 3 days.
		let daysLeft = 0;
		if ( Math.floor( timeLeft / 86400 ) > 3 ) {
			daysLeft = Math.floor( timeLeft / 86400 );
			if ( daysLeft ) {
				timeLeft -= (daysLeft * 86400);
			}
		}

		const hoursLeft = Math.floor( timeLeft / 3600 );
		if ( hoursLeft ) {
			timeLeft -= (hoursLeft * 3600);
		}

		const minutesLeft = Math.floor( timeLeft / 60 );
		if ( minutesLeft ) {
			timeLeft -= (minutesLeft * 60);
		}

		const secondsLeft = Math.floor( timeLeft );

		let text = `${this.pad(hoursLeft)}:${this.pad(minutesLeft)}:${this.pad(secondsLeft)}`;
		if ( daysLeft ) {
			text = `${daysLeft}:${text}`;
		}

		this.$element[0].innerText = text;
	}

	pad( num: number ): string
	{
		if ( num < 10 ) {
			return '0' + num;
		}
		return '' + num;
	}

	ngOnDestroy()
	{
		if ( this.intervalHandle ) {
			window.clearInterval( this.intervalHandle );
		}
	}
}
