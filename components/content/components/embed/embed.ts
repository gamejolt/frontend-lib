import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import AppLoading from '../../../../vue/components/loading/loading.vue';
import AppVideoEmbed from '../../../video/embed/embed.vue';
import { ContentEmbedService } from '../../content-editor/content-embed.service';
import { ContentOwner } from '../../content-owner';
import AppBaseContentComponent from '../base/base-content-component.vue';
import AppContentEmbedCommunityEmbed from './community/community-embed.vue';
import AppContentEmbedGameEmbed from './game/game-embed.vue';
import AppContentEmbedSoundcloudEmbed from './soundcloud/soundcloud-embed.vue';
import AppContentEmbedUserEmbed from './user/user-embed.vue';

@Component({
	components: {
		AppVideoEmbed,
		AppContentEmbedSoundcloudEmbed,
		AppBaseContentComponent,
		AppContentEmbedGameEmbed,
		AppContentEmbedUserEmbed,
		AppContentEmbedCommunityEmbed,
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
		return this.isEditing && ['youtube-video', 'soundcloud-song'].includes(this.type);
	}

	get hasSourceUrl() {
		return this.sourceUrl.length > 0;
	}

	mounted() {
		// If the placeholder input is available, focus it immediately
		if (this.$refs.inputElement) {
			this.$refs.inputElement.focus();
		}

		this.onTypeChange();
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
		switch (e.keyCode) {
			case 8: // 8 => Backspace
				// remove this node if backspace was pressed at the start of the input element.
				if (
					this.$refs.inputElement.selectionStart === 0 &&
					this.$refs.inputElement.selectionEnd === 0
				) {
					this.$emit('removed');
				}
				break;
			case 13: // 13 => Enter
				this.loading = true;
				const data = await ContentEmbedService.getEmbedData(
					this.owner,
					this.$refs.inputElement.value
				);
				if (data !== undefined) {
					this.$emit('updateAttrs', data);
				}
				this.loading = false;
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
