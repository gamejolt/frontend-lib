import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./selector.html';

import { SiteTemplate } from '../../site/template/template-model';
import { Popover } from '../../popover/popover.service';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppPopover } from '../../popover/popover';
import { AppPopoverTrigger } from '../../popover/popover-trigger.directive.vue';

@View
@Component({
	components: {
		AppJolticon,
		AppPopover,
	},
	directives: {
		AppPopoverTrigger,
	},
})
export class AppThemeSelector extends Vue {
	@Prop(Array) templates: SiteTemplate[];
	@Prop(Number) currentTemplate: number;

	current: SiteTemplate | null = null;

	created() {
		if (this.currentTemplate) {
			this.current = this.templates.find(t => t.id === this.currentTemplate) || null;
		}
	}

	select(id: number) {
		this.currentTemplate = id;
		this.current = this.templates.find(t => t.id === this.currentTemplate) || null;
		this.$emit('changed', id);
		Popover.hideAll();
	}
}
