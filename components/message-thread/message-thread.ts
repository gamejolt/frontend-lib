import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./message-thread.html';
import '../timeline-list/timeline-list.styl';

@View
@Component({})
export class AppMessageThread extends Vue {}
