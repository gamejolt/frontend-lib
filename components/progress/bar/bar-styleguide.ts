import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./bar-styleguide.html';
import { AppProgressBar } from './bar';

@View
@Component({
	components: {
		AppProgressBar,
	},
})
export class AppProgressBarStyleguide extends Vue {
	progress = 0;
}
