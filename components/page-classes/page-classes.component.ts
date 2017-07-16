import { Component, OnChanges, Input } from 'ng-metadata/core';

@Component({
	selector: 'gj-page-classes',
	template: '<div ng-class="$ctrl.currentClasses" ng-transclude></div>',
	legacy: {
		transclude: true,
	},
})
export class PageClassesComponent implements OnChanges {
	@Input() stateName: string;

	currentClasses: string[] = [];

	ngOnChanges() {
		if (this.stateName && typeof this.stateName === 'string') {
			const pageClass = this.stateName.replace('-', '').replace(/\./g, '-').toLowerCase();

			this.currentClasses = [];
			const pieces = pageClass.split('-');
			let currentPrefix = 'ctrl';
			for (let i = 0; i < pieces.length; ++i) {
				currentPrefix += '-' + pieces[i];
				this.currentClasses.push(currentPrefix);
			}

			this.currentClasses.push(currentPrefix + '-page');
		}
	}
}
