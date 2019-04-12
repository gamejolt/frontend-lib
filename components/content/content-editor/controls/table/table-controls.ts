import Vue from 'vue';
import { Component, Emit } from 'vue-property-decorator';
import AppPopper from '../../../../popper/popper.vue';
import { AppTooltip } from '../../../../tooltip/tooltip';

@Component({
	components: {
		AppPopper,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppContentEditorTableControls extends Vue {
	@Emit('insertRowAbove')
	onClickInsertRowAbove() {}

	@Emit('insertRowBelow')
	onClickInsertRowBelow() {}

	@Emit('insertColumnLeft')
	onClickInsertColumnLeft() {}

	@Emit('insertColumnRight')
	onClickInsertColumnRight() {}

	@Emit('removeRow')
	onClickRemoveRow() {}

	@Emit('removeColumn')
	onClickRemoveColumn() {}

	@Emit('removeTable')
	onClickRemoveTable() {}

	@Emit('toggleHeader')
	onClickToggleHeader() {}
}
