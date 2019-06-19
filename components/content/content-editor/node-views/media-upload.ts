import AppContentMediaUpload from '../../components/media-upload/media-upload.vue';
import { HydratableNodeView } from './hydratable';

export class MediaUploadNodeView extends HydratableNodeView {
	mounted() {
		const vm = new AppContentMediaUpload({
			propsData: {
				src: this.node.attrs.src,
				uploadId: this.node.attrs.uploadId,
				nameHint: this.node.attrs.nameHint,
				editorView: this.view,
				owner: this.owner,
			},
		});
		this.mountVue(vm);
	}
}
