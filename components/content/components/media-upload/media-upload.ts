import View from '!view!./media-upload.html?style=./media-upload.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppLoading } from '../../../../vue/components/loading/loading';

@View
@Component({
	components: {
		AppLoading,
	},
})
export class AppContentMediaUpload extends Vue {
	@Prop(String)
	src!: string;

	mounted() {
		// Start uploading media item
	}
}
