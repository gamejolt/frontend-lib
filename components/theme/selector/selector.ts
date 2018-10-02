import View from '!view!./selector.html';
import { AppPopper } from 'game-jolt-frontend-lib/components/popper/popper';
import { Popper } from 'game-jolt-frontend-lib/components/popper/popper.service';
import { AppJolticon } from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { SiteTemplate } from '../../site/template/template-model';

@View
@Component({
	components: {
		AppJolticon,
		AppPopper,
	},
})
export class AppThemeSelector extends Vue {
	@Prop(Array)
	templates!: SiteTemplate[];

	@Prop(Number)
	currentTemplate!: number;

	current: SiteTemplate | null = null;

	@Watch('currentTemplate')
	onTemplateChange() {
		this.current = this.templates.find(t => t.id === this.currentTemplate) || null;
	}

	created() {
		if (this.currentTemplate) {
			this.onTemplateChange();
		}
	}

	select(id: number) {
		this.$emit('change', id);
		Popper.hideAll();
	}
}
