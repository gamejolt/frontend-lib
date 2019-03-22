import View from '!view!./table-controls.html?style=./table-controls.styl';
import { AppPopper } from 'game-jolt-frontend-lib/components/popper/popper';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import Vue from 'vue';
import { Component, Emit } from 'vue-property-decorator';

@View
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
}
