import { HydratableNodeView } from 'game-jolt-frontend-lib/components/content/content-editor/node-views/hydratable';
import { AppContentMediaUpload } from '../../components/media-upload/media-upload';

export class MediaUploadNodeView extends HydratableNodeView {
	mounted() {
		const vm = new AppContentMediaUpload({
			propsData: {
				src: this.node.attrs.src,
				uploadId: this.node.attrs.uploadId,
				editorView: this.view,
				owner: this.owner,
			},
		});
		this.mountVue(vm);
	}
}
