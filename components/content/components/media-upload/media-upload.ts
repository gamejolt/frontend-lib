import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { makeFileFromDataUrl } from '../../../../utils/image';
import { Api } from '../../../api/api.service';
import { Growls } from '../../../growls/growls.service';
import { MediaItem } from '../../../media-item/media-item-model';
import AppProgressBar from '../../../progress/bar/bar.vue';
import { getMediaItemTypeForContext } from '../../content-context';
import { ContentOwner } from '../../content-owner';

@Component({
	components: {
		AppProgressBar,
	},
})
export default class AppContentMediaUpload extends Vue {
	@Prop(String)
	src!: string;

	@Prop(String)
	uploadId!: string;

	@Prop(EditorView)
	editorView!: EditorView;

	@Prop(Object)
	owner!: ContentOwner;

	uploadProgress = 0;
	uploadProcessing = false;

	async mounted() {
		// Start uploading media item
		const file = makeFileFromDataUrl(this.src, 'pasted_image.png');

		try {
			const mediaItem = await this.uploadFile(file);
			if (mediaItem instanceof MediaItem) {
				const nodePos = this.findTargetNodePos();
				if (nodePos !== -1) {
					const tr = this.editorView.state.tr;
					tr.setNodeMarkup(nodePos, this.editorView.state.schema.nodes.mediaItem, {
						id: mediaItem.id,
						width: mediaItem.width,
						height: mediaItem.height,
						align: 'center',
						caption: '',
					});
					this.editorView.dispatch(tr);
				}
			}
		} catch (error) {
			const nodePos = this.findTargetNodePos();
			if (nodePos !== -1) {
				const tr = this.editorView.state.tr;
				tr.delete(nodePos, nodePos + 1);
				this.editorView.dispatch(tr);
			}

			Growls.error({
				title: 'Oh no!',
				message: 'Something went wrong while uploading your image.',
			});
		}
	}

	private async uploadFile(file: File) {
		this.uploadProgress = 0;
		this.uploadProcessing = false;
		const itemType = getMediaItemTypeForContext(this.owner.getContext());
		const parentId = await this.owner.getModelId();
		const $payload = await Api.sendRequest(
			'/web/dash/media-items/add',
			{
				type: itemType,
				parent_id: parentId,
			},
			{
				file,
				progress: this.handleProgressEvent,
				detach: true,
			}
		);
		if ($payload.success && $payload.mediaItems && $payload.mediaItems.length === 1) {
			return new MediaItem($payload.mediaItems[0]);
		}
	}

	private handleProgressEvent(e: ProgressEvent | null) {
		if (e !== null) {
			this.uploadProgress = e.loaded / e.total;
			if (this.uploadProgress >= 1) {
				this.uploadProgress = 1;
				this.uploadProcessing = true;
			}
		} else {
			this.uploadProgress = 1;
			this.uploadProcessing = true;
		}
	}

	private findTargetNodePos() {
		// Loops through nodes trying to find the mediaUpload node with a matching uploadId
		for (let i = 0; i < this.editorView.state.doc.nodeSize; i++) {
			const node = this.editorView.state.doc.nodeAt(i);
			if (
				node !== null &&
				node !== undefined &&
				node.type.name === 'mediaUpload' &&
				node.attrs.uploadId === this.uploadId
			) {
				return i;
			}
		}
		return -1;
	}
}
