import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./feed.html';

@View
@Component({})
export class AppFeed extends Vue {}
