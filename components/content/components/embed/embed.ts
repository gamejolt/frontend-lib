import View from '!view!./embed.html?style=./embed.styl';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { AppVideoEmbed } from '../../../video/embed/embed';

@View
@Component({
	components: {
		AppVideoEmbed,
	},
})
export class AppContentEmbed extends Vue {
	@Prop(String)
	type!: string;

	@Prop(String)
	source!: string;
}
