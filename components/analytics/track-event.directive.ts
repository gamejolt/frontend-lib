import { Directive, HostListener, Input } from 'ng-metadata/core';
import { Analytics } from './analytics.service';

@Directive({
	selector: '[gj-track-event]',
})
export class TrackEventDirective {
	@Input('@gjTrackEvent') event: string;

	@HostListener('click')
	click() {
		if (this.event) {
			const pieces = this.event.split(':');
			Analytics.trackEvent(pieces[0], pieces[1], pieces[2], pieces[3]);
		}
	}
}
