import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { arrayShuffle } from '../../../../utils/array';
import AppLoading from '../../../../vue/components/loading/loading.vue';
import AppVideoEmbed from '../../../video/embed/embed.vue';
import { ContentEmbedService } from '../../content-editor/content-embed.service';
import { ContentOwner } from '../../content-owner';
import AppBaseContentComponent from '../base/base-content-component.vue';
import AppContentEmbedSketchfab from './sketchfab/sketchfab.vue';
import AppContentEmbedSoundcloud from './soundcloud/soundcloud.vue';

@Component({
	components: {
		AppVideoEmbed,
		AppContentEmbedSoundcloud,
		AppBaseContentComponent,
		AppContentEmbedSketchfab,
		AppLoading,
	},
})
export default class AppContentEmbed extends Vue {
	@Prop(String)
	type!: string;

	@Prop(String)
	source!: string;

	@Prop(Object)
	owner!: ContentOwner;

	@Prop(Boolean)
	isEditing!: boolean;

	@Prop(Boolean)
	isDisabled!: boolean;

	@Prop(String)
	inputValue!: string;

	sourceUrl: string = '';
	loading = false;
	previewEmbeds: any[] = [];

	$refs!: {
		inputElement: HTMLInputElement;
	};

	get capabilities() {
		return this.owner.getCapabilities();
	}

	get hydrator() {
		return this.owner.getHydrator();
	}

	get hasContent() {
		return this.type && this.source;
	}

	get shouldShowOverlay() {
		return this.isEditing;
	}

	get hasSourceUrl() {
		return this.sourceUrl.length > 0;
	}

	get hasMoreEmbedPreviews() {
		return this.previewEmbeds.length < ContentEmbedService.previewSources.length;
	}

	mounted() {
		// If the placeholder input is available, focus it immediately
		if (this.$refs.inputElement) {
			this.$refs.inputElement.focus();
		}

		this.setRandomEmbedPills();

		this.onTypeChange();
	}

	private setRandomEmbedPills() {
		this.previewEmbeds = arrayShuffle(ContentEmbedService.previewSources).slice(0, 3);
	}

	onRemoved() {
		this.$emit('removed');
	}

	onInput(e: Event) {
		if (e.target instanceof HTMLInputElement) {
			this.$emit('updateAttrs', { source: e.target.value });
		}
	}

	async onKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'Backspace':
				// remove this node if backspace was pressed at the start of the input element.
				if (
					this.$refs.inputElement.selectionStart === 0 &&
					this.$refs.inputElement.selectionEnd === 0
				) {
					this.$emit('removed');
				}
				break;
			case 'Enter':
				this.loading = true;
				const data = await ContentEmbedService.getEmbedData(
					this.owner,
					this.$refs.inputElement.value
				);
				if (data !== undefined) {
					this.$emit('updateAttrs', data);
				} else {
					Growls.error({
						title: this.$gettext(`Uh oh`),
						message: this.$gettext(
							`Something went wrong embedded your content. Maybe try again with a different link?`
						),
					});
				}
				this.loading = false;
				e.preventDefault();
				break;
			case 'Escape':
				this.$emit('removed');
				e.preventDefault();
				break;
		}
	}

	@Watch('type')
	async onTypeChange() {
		if (this.isEditing) {
			const url = await ContentEmbedService.getSourceUrl(
				this.type,
				this.source,
				this.owner.getHydrator()
			);
			if (url !== undefined) {
				this.sourceUrl = url;
			} else {
				this.sourceUrl = '';
			}
		}
	}
}
