import View from '!view!./card.html?style=./card.styl';
import { Navigate } from 'game-jolt-frontend-lib/components/navigate/navigate.service';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Analytics } from '../../../analytics/analytics.service';
import { AppTrackEvent } from '../../../analytics/track-event.directive.vue';
import { AppCard } from '../../../card/card';
import { AppFadeCollapse } from '../../../fade-collapse/fade-collapse';
import { AppTooltip } from '../../../tooltip/tooltip';
import { GameBuild } from '../../build/build.model';
import { GameExternalPackage } from '../external-package.model';

@View
@Component({
	components: {
		AppCard,
		AppFadeCollapse,
	},
	directives: {
		AppTooltip,
		AppTrackEvent,
	},
})
export class AppGameExternalPackageCard extends Vue {
	@Prop(GameExternalPackage)
	package!: GameExternalPackage;

	showFullDescription = false;
	canToggleDescription = false;

	readonly GameBuild = GameBuild;

	get platforms() {
		const platforms = [];
		for (let prop in this.package) {
			if (!(this.package as any)[prop]) {
				continue;
			}

			for (let prefix of ['os_', 'type_']) {
				if (!prop.startsWith(prefix)) {
					continue;
				}

				const field = prop.substr(prefix.length);
				if (field in GameBuild.platformSupportInfo) {
					platforms.push(field);
				}
			}
		}
		return platforms;
	}

	gotoExternal() {
		Analytics.trackEvent('game-package-card', 'download', 'external');

		Navigate.newWindow(this.package.url);
	}
}