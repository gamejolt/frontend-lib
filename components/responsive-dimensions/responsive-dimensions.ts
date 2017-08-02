import Vue from 'vue';
import { Subscription } from 'rxjs/Subscription';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { Screen } from '../screen/screen-service';
import { Ruler } from '../ruler/ruler-service';

@Component({})
export class AppResponsiveDimensions extends Vue {
	@Prop(Number) ratio: number;

	private resize$: Subscription | undefined;
	private height = 'auto';

	mounted() {
		this.resize$ = Screen.resizeChanges.subscribe(() => this.updateDimensions());
		this.updateDimensions();
	}

	destroyed() {
		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}
	}

	render(h: Vue.CreateElement) {
		return h('div', { style: { height: this.height } }, this.$slots.default);
	}

	@Watch('ratio')
	private updateDimensions() {
		const containerWidth = Ruler.width(this.$el.parentNode as HTMLElement);
		const height = containerWidth / this.ratio;
		this.height = `${height}px`;
		this.$emit('change', [containerWidth, height]);
	}
}
