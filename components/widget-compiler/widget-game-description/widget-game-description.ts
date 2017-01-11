import { provide } from 'ng-metadata/core';

import { WidgetCompilerWidgetGameDescription } from './widget-game-description.service';

export default angular.module( 'gj.WidgetCompiler.WidgetGameDescription', [] )
.service( ...provide( 'WidgetCompilerWidgetGameDescription', { useClass: WidgetCompilerWidgetGameDescription } ) )
.name;
