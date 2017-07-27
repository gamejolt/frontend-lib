import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./timeline-list.html';

@View
@Component({})
export class AppTimelineList extends Vue {}
