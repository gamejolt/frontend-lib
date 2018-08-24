import Vue from 'vue';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View400 from '!view!./page-400.html';
import View403 from '!view!./page-403.html';
import View500 from '!view!./page-500.html';
import View404 from '!view!./page-404.html';
import ViewOffline from '!view!./page-offline.html';
import { Navigate } from '../../navigate/navigate.service';

@View400
@Component({})
export class AppErrorPage400 extends Vue {}

@View403
@Component({})
export class AppErrorPage403 extends Vue {}

@View404
@Component({})
export class AppErrorPage404 extends Vue {}

@View500
@Component({})
export class AppErrorPage500 extends Vue {}

@ViewOffline
@Component({})
export class AppErrorPageOffline extends Vue {
	@State
	retry() {
		Navigate.reload();
	}
}

export const ErrorPages: any = {
	400: AppErrorPage400,
	403: AppErrorPage403,
	404: AppErrorPage404,
	500: AppErrorPage500,
	offline: AppErrorPageOffline,
};
