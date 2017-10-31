import Vue from 'vue';
import Cropper from 'cropperjs';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./crop.html?style=./crop.styl';
import 'cropperjs/dist/cropper.css';

interface CropData {
	x: number;
	y: number;
	x2: number;
	y2: number;
}

@View
@Component({})
export class AppImgCrop extends Vue {
	@Prop(String) src: string;
	@Prop(Object) value?: CropData;
	@Prop(Number) aspectRatio?: number;
	@Prop(Number) minWidth?: number;
	@Prop(Number) minHeight?: number;
	@Prop(Boolean) disabled?: boolean;

	cropper: Cropper;

	$refs: {
		img: HTMLImageElement;
	};

	mounted() {
		this.cropper = new Cropper(this.$refs.img, {
			aspectRatio: this.aspectRatio,
			viewMode: 1,
			guides: false,
			rotatable: false,
			zoomable: false,
			autoCropArea: 1,
			checkCrossOrigin: false,
			crop: e => {
				// Have to do it like this since the cropper doesn't allow
				// img-relative minimums.
				if (this.minWidth && this.minHeight) {
					if (e.detail.width < this.minWidth || e.detail.height < this.minHeight) {
						this.cropper.setData(
							Object.assign({}, e.detail, {
								width: e.detail.width < this.minWidth ? this.minWidth : e.detail.width,
								height: e.detail.height < this.minHeight ? this.minHeight : e.detail.height,
							})
						);
						return;
					}
				}

				this.$emit(
					'input',
					{
						x: e.detail.x,
						y: e.detail.y,
						x2: e.detail.x + e.detail.width,
						y2: e.detail.y + e.detail.height,
					} as CropData
				);
			},
			ready: () => {
				if (this.disabled) {
					this.onDisabledChange();
				}

				if (this.value) {
					this.onValueChange();
				}
			},
		});
	}

	beforeDestroy() {
		this.cropper.destroy();
	}

	@Watch('src')
	onSrcChange() {
		this.cropper.replace(this.src);
	}

	@Watch('disabled')
	onDisabledChange() {
		if (this.disabled) {
			this.cropper.disable();
		} else {
			this.cropper.enable();
		}
	}

	@Watch('value')
	onValueChange() {
		if (this.value) {
			this.cropper.setData({
				x: this.value.x,
				y: this.value.y,
				width: this.value.x2 - this.value.x,
				height: this.value.y2 - this.value.y,
				rotate: 0,
				scaleX: 1,
				scaleY: 1,
			});
		} else {
			this.cropper.clear();
		}
	}
}
