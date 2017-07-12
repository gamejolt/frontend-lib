import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./list-group-styleguide.html';

@View
@Component({})
export class AppListGroupStyleguide extends Vue {
	lgSelector = 0;
}
