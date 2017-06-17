import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./file-preview.html';

import { isImage } from '../../../../../utils/image';
import { AppJolticon } from '../../../../../vue/components/jolticon/jolticon';
import { Ruler } from '../../../../ruler/ruler-service';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppFormControlUploadFilePreview extends Vue {
	@Prop() file: File;

	get isImage() {
		return isImage(this.file);
	}

	mounted() {
		if (!FileReader || !CanvasRenderingContext2D || !this.isImage) {
			return;
		}

		const reader = new FileReader();
		reader.onload = e => this.onLoadFile(e);
		reader.readAsDataURL(this.file);
	}

	clearFile() {
		this.$emit('clear');
	}

	onLoadFile(e: any) {
		const img = new Image();
		img.onload = () => this.onLoadImage(img);
		img.src = e.target.result;
	}

	onLoadImage(img: HTMLImageElement) {
		const canvas = this.$refs.preview as HTMLCanvasElement;
		const elementWidth = Ruler.outerWidth(canvas);
		const width = elementWidth;
		const height = img.height / img.width * elementWidth;
		canvas.width = width;
		canvas.height = height;
		canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
	}
}
