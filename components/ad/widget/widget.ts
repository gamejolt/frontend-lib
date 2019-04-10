import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Ads, AdSlotPos, AdSlotPosValidator } from '../../../components/ad/ads.service';
import AppAdPlaywire from '../playwire/playwire.vue';
import './widget-content.styl';

@Component({
	components: {
		AppAdPlaywire,
	},
})
export default class AppAdWidget extends Vue {
	@Prop({ type: String, default: 'rectangle' })
	size!: 'rectangle' | 'leaderboard';

	@Prop({
		type: String,
		validator: AdSlotPosValidator,
	})
	pos!: AdSlotPos;

	get shouldShow() {
		return Ads.shouldShow;
	}
}
