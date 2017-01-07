import { GameSketchfabFactory } from './sketchfab.model';

export default angular.module( 'gj.Game.Sketchfab', [ 'gj.Model', 'gj.Game' ] )
.service( 'GameSketchfab', GameSketchfabFactory )
.name;
