import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./growl.html?style=./growl.styl';

import { Growl } from './growls.service';
import { makeObservableService } from '../../utils/vue';
import { Screen } from '../screen/screen-service';
import { AppJolticon } from '../../vue/components/jolticon/jolticon';
import { AppGrowlDynamic } from './growl-dynamic';

require('./growl-content.styl');

@View
@Component({
	components: {
		AppJolticon,
		AppGrowlDynamic,
	},
})
export class AppGrowl extends Vue {
	@Prop(Number) index: number;
	@Prop(Object) growl: Growl;

	Screen = makeObservableService(Screen);

	private leaveTimer?: NodeJS.Timer;

	mounted() {
		if (!this.growl.sticky) {
			this.setLeaveTimer();
		}
	}

	// When they click on the element, never auto-leave again.
	// They must explictly close it after that.
	onClick(event: Event) {
		if (this.growl.onclick) {
			this.growl.onclick(event);
			this.remove(event);
		}
	}

	remove(event?: Event) {
		if (event) {
			event.stopPropagation();
		}

		// Remove from the growls list.
		this.growl.close();
	}

	/**
	 * After a certain amount of time has elapsed, we want to remove the growl message.
	 */
	setLeaveTimer() {
		if (this.growl.sticky || this.leaveTimer) {
			return;
		}

		// We store the promise so we can cancel.
		this.leaveTimer = setTimeout(() => {
			this.remove();
		}, 2500);
	}

	/**
	 * Cancel the leave timer if there is one set.
	 */
	cancelLeave() {
		if (this.growl.sticky || !this.leaveTimer) {
			return;
		}

		clearTimeout(this.leaveTimer);
		this.leaveTimer = undefined;
	}
}
