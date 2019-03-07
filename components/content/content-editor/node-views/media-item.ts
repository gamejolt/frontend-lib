import { AppContentMediaItem } from '../../components/media-item/media-item';
import { HydratableNodeView } from './hydratable';

export class MediaItemNodeView extends HydratableNodeView {
	mounted() {
		const vm = new AppContentMediaItem({
			propsData: {
				mediaItemId: this.node.attrs.id,
				mediaItemWidth: this.node.attrs.width,
				mediaItemHeight: this.node.attrs.height,
				owner: this.owner,
			},
		});
		this.mountVue(vm);
	}
}
