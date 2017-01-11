import { provide } from 'ng-metadata/core';

import { WidgetCompilerWidgetGamePackages } from './widget-game-packages.service';

export default angular.module( 'gj.WidgetCompiler.WidgetGamePackages', [] )
.service( ...provide( 'WidgetCompilerWidgetGamePackages', { useClass: WidgetCompilerWidgetGamePackages } ) )
.name;
