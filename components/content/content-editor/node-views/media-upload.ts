import { BaseNodeView } from 'game-jolt-frontend-lib/components/content/content-editor/node-views/base';
import { AppContentMediaUpload } from '../../components/media-upload/media-upload';

export class MediaUploadNodeView extends BaseNodeView {
	mounted() {
		const vm = new AppContentMediaUpload({
			propsData: {
				src: this.node.attrs.src,
			},
		});
		this.mountVue(vm);
	}
}
