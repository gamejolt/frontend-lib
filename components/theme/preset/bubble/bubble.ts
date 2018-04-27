import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./bubble.html?style=./bubble.styl';

import { ThemePreset } from '../../preset/preset.model';

@View
@Component({})
export class AppThemeBubble extends Vue {
	@Prop(ThemePreset) theme: ThemePreset;
}
