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
	isMenuShown = false;

	@Emit('insertRowAbove')
	onClickInsertRowAbove() {
		this.isMenuShown = false;
	}

	@Emit('insertRowBelow')
	onClickInsertRowBelow() {
		this.isMenuShown = false;
	}

	@Emit('insertColumnLeft')
	onClickInsertColumnLeft() {
		this.isMenuShown = false;
	}

	@Emit('insertColumnRight')
	onClickInsertColumnRight() {
		this.isMenuShown = false;
	}

	@Emit('removeRow')
	onClickRemoveRow() {
		this.isMenuShown = false;
	}

	@Emit('removeColumn')
	onClickRemoveColumn() {
		this.isMenuShown = false;
	}

	@Emit('removeTable')
	onClickRemoveTable() {
		this.isMenuShown = false;
	}

	@Emit('toggleHeader')
	onClickToggleHeader() {
		this.isMenuShown = false;
	}
}
