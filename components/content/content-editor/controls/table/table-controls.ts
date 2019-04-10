import AppPopper from 'game-jolt-frontend-lib/components/popper/popper.vue';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import Vue from 'vue';
import { Component, Emit } from 'vue-property-decorator';

@Component({
	components: {
		AppPopper,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppContentEditorTableControls extends Vue {
	remove() {}

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
