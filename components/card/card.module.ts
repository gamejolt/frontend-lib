import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../vue/angular-link';
import { AppCard } from './card';
import { CardDragHandleComponent } from './drag-handle.component';

@NgModule({
	declarations: [makeComponentProvider(AppCard), CardDragHandleComponent],
})
export class CardModule {}
