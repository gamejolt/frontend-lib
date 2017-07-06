import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./expand.html?style=./expand.styl';

@View
@Component({})
export class AppExpand extends Vue {
	@Prop([Boolean])
	when?: boolean;
	@Prop([Boolean])
	animateInitial?: boolean;

	inDom = false;

	// Used for a hack to force browser reflow.
	private reflow: number;

	created() {
		this.inDom = !!this.when;
	}

	async mounted() {
		if (this.inDom) {
			this.$el.style.height = 'auto';

			// This simulates having it closed and then showing immediately to
			// slide it out.
			if (this.animateInitial) {
				this.$el.style.height = '0';
				this.inDom = false;
				await this.$nextTick();
				this.onWhenWatch();
			}
		}
	}

	@Watch('when')
	async onWhenWatch() {
		if (this.when) {
			// Show in DOM as soon as possible.
			// This will get the correct height to expand out to.
			this.inDom = true;
			this.$el.classList.add('transition');
			await this.$nextTick();

			// Should be in DOM now so we can pull height.
			this.$el.style.height = this.$el.scrollHeight + 'px';
		} else {
			this.$el.style.height = this.$el.scrollHeight + 'px';

			// This hack forces a browser reflow.
			// This way the change from explicit height to 0 is noticed.
			this.reflow = this.$el.offsetWidth;

			this.$el.classList.add('transition');
			this.$el.style.height = '0';
		}
	}

	// For clean up work after transitions.
	afterTransition() {
		if (this.when) {
			this.$el.classList.remove('transition');
			this.$el.style.height = 'auto';
		} else if (!this.when) {
			this.$el.classList.remove('transition');
			this.inDom = false;
		}
	}
}
