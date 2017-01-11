import { provide } from 'ng-metadata/core';

import { WidgetCompilerWidgetGameMedia } from './widget-game-media.service';

export default angular.module( 'gj.WidgetCompiler.WidgetGameMedia', [] )
.service( ...provide( 'WidgetCompilerWidgetGameMedia', { useClass: WidgetCompilerWidgetGameMedia } ) )
.name;
