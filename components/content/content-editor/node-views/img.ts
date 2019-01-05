import { AppContentImg } from '../../components/img/img';
import { BaseNodeView } from './base';

export class ImgNodeView extends BaseNodeView {
	mounted() {
		const vm = new AppContentImg({
			propsData: {
				src: this.node.attrs.src,
			},
		});
		this.mountVue(vm);
	}
}
