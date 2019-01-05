import View from '!view!./embed.html?style=./embed.styl';
import { AppWidgetCompilerWidgetSoundcloud } from 'game-jolt-frontend-lib/components/widget-compiler/widget-soundcloud/widget-soundcloud';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { AppVideoEmbed } from '../../../video/embed/embed';
import { AppBaseContentComponent } from '../base/base-content-component';

@View
@Component({
	components: {
		AppVideoEmbed,
		AppBaseContentComponent,
		AppWidgetCompilerWidgetSoundcloud,
	},
})
export class AppContentEmbed extends Vue {
	@Prop(String)
	type!: string;

	@Prop(String)
	source!: string;

	@Prop(Boolean)
	isEditing!: boolean;

	onRemoved() {
		this.$emit('removed');
	}
}
